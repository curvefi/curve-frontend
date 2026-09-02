import fs from 'node:fs'
import module from 'node:module'
import path from 'node:path'

const builtinModules = new Set([
  ...module.builtinModules,
  ...module.builtinModules.map(name => `node:${name}`),
  ...module.builtinModules.map(name => name.replace(/^node:/, '')),
])

const packageJsonCache = new Map()
const reportedWildcardPackageJsons = new Set()

const aliasPackages = new Map([
  ['@cy', null],
  ['@evm-ui', 'evm-ui'],
  ['@external-rewards', 'external-rewards'],
  ['@legacy-ui', 'legacy-ui'],
  ['@primitives', '@curvefi/primitives'],
])

const getFilename = context =>
  context.physicalFilename && context.physicalFilename !== '<text>' ? context.physicalFilename : context.filename

const normalizePath = filePath => filePath.split(path.sep).join('/')

const isExternalSpecifier = specifier =>
  typeof specifier === 'string' &&
  specifier.length > 0 &&
  !specifier.startsWith('.') &&
  !specifier.startsWith('/') &&
  !specifier.startsWith('#') &&
  !specifier.startsWith('@/') &&
  !builtinModules.has(specifier)

const getPackageName = specifier => {
  for (const [alias, packageName] of aliasPackages) {
    if (specifier === alias || specifier.startsWith(`${alias}/`)) return packageName
  }

  const [scopeOrName, scopedName] = specifier.split('/')
  return scopeOrName?.startsWith('@') ? `${scopeOrName}/${scopedName}` : scopeOrName
}

const findPackageJson = filename => {
  let directory = path.dirname(filename)

  while (directory !== path.dirname(directory)) {
    const packageJsonPath = path.join(directory, 'package.json')
    if (fs.existsSync(packageJsonPath)) return packageJsonPath
    directory = path.dirname(directory)
  }

  return null
}

const readPackageJson = packageJsonPath => {
  if (!packageJsonCache.has(packageJsonPath)) {
    packageJsonCache.set(packageJsonPath, JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')))
  }

  return packageJsonCache.get(packageJsonPath)
}

const getBundledDependencies = manifest => manifest.bundledDependencies ?? manifest.bundleDependencies

const dependencySections = ['dependencies', 'peerDependencies', 'optionalDependencies']
const packageJsonDependencySections = [...dependencySections, 'devDependencies']

const getWildcardDeclarations = manifest =>
  packageJsonDependencySections.flatMap(section =>
    Object.entries(manifest[section] ?? {})
      .filter(([, version]) => version === '*')
      .map(([packageName]) => ({ packageName, section })),
  )

const findDeclaration = ({ manifest, packageName, allowDevDependencies }) => {
  if (manifest.name === packageName) return { section: 'self', version: manifest.version }

  for (const section of dependencySections) {
    const version = manifest[section]?.[packageName]
    if (version) return { section, version }
  }

  if (getBundledDependencies(manifest)?.includes(packageName)) return { section: 'bundledDependencies', version: manifest.version }

  const devVersion = manifest.devDependencies?.[packageName]
  return allowDevDependencies && devVersion ? { section: 'devDependencies', version: devVersion } : null
}

const isAllowedWildcardDeclaration = ({ declaration }) => declaration.version !== '*'

const isDevDependencyContext = filename => {
  const normalized = normalizePath(filename)
  const basename = path.basename(filename)

  return (
    /(?:^|\/)(?:test|tests|cypress|scripts)\//u.test(normalized) ||
    /(?:^|\/)\.storybook\//u.test(normalized) ||
    /\.(?:cy|spec|stories|test)\.[cm]?[jt]sx?$/u.test(basename) ||
    /^(?:eslint|vite|vitest|playwright|cypress|storybook)\.config\.[cm]?[jt]s$/u.test(basename)
  )
}

const getImportArgument = ({ arguments: args, callee }) =>
  (callee.type === 'Import' || (callee.type === 'Identifier' && callee.name === 'require')) &&
  args[0]?.type === 'Literal' &&
  typeof args[0].value === 'string'
    ? args[0]
    : null

/**
 * Requires package imports to be declared by the nearest package.json.
 *
 * @type {eslint.Rule.Module}
 */
export const noUndeclaredDependenciesRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow importing packages that are not declared in the nearest package.json' },
    messages: {
      undeclaredDependency:
        '`{{packageName}}` is imported but not declared in {{packageJsonPath}}. Add it to dependencies or peerDependencies.',
      undeclaredDevDependency:
        '`{{packageName}}` is imported but not declared in {{packageJsonPath}}. Add it to dependencies, peerDependencies, or devDependencies.',
      wildcardDependency:
        '`{{packageName}}` is declared as `*` in {{packageJsonPath}}. Declare an explicit version instead.',
      wildcardPackageJsonDependency:
        '`{{packageName}}` is declared as `*` in {{packageJsonPath}} {{section}}. Declare an explicit version instead.',
    },
  },
  create(context) {
    const filename = getFilename(context)
    const packageJsonPath = findPackageJson(filename)
    if (!packageJsonPath) return {}

    const manifest = readPackageJson(packageJsonPath)
    const allowDevDependencies = isDevDependencyContext(filename)
    const relativePackageJsonPath = normalizePath(path.relative(process.cwd(), packageJsonPath))

    const checkSpecifier = (specifier, node) => {
      if (!isExternalSpecifier(specifier)) return

      const packageName = getPackageName(specifier)
      if (!packageName) return

      const declaration = findDeclaration({ manifest, packageName, allowDevDependencies })
      if (!declaration) {
        context.report({
          node,
          messageId: allowDevDependencies ? 'undeclaredDevDependency' : 'undeclaredDependency',
          data: { packageName, packageJsonPath: relativePackageJsonPath },
        })
        return
      }

      if (isAllowedWildcardDeclaration({ declaration })) return

      context.report({
        node,
        messageId: 'wildcardDependency',
        data: { packageName, packageJsonPath: relativePackageJsonPath },
      })
    }

    return {
      Program: node => {
        if (reportedWildcardPackageJsons.has(packageJsonPath)) return

        reportedWildcardPackageJsons.add(packageJsonPath)
        for (const { packageName, section } of getWildcardDeclarations(manifest)) {
          context.report({
            node,
            messageId: 'wildcardPackageJsonDependency',
            data: { packageName, packageJsonPath: relativePackageJsonPath, section },
          })
        }
      },
      ImportDeclaration: node => checkSpecifier(node.source.value, node.source),
      ExportNamedDeclaration: node => node.source && checkSpecifier(node.source.value, node.source),
      ExportAllDeclaration: node => checkSpecifier(node.source.value, node.source),
      CallExpression: node => {
        const importArgument = getImportArgument(node)
        if (importArgument) checkSpecifier(importArgument.value, importArgument)
      },
    }
  },
}
