import fs from 'node:fs'
import { builtinModules, findPackageJSON } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const builtinNames = new Set(builtinModules.flatMap(name => [name, name.replace(/^node:/, '')]))

/** Reads a JSON file. */
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))

/** Returns runtime and development dependency names. */
const getDependencies = ({ dependencies = {}, devDependencies = {} }) =>
  new Set([...Object.keys(dependencies), ...Object.keys(devDependencies)])

/** Reads TypeScript path aliases from a package. */
const readAliases = dir => {
  const file = path.join(dir, 'tsconfig.json')
  if (!fs.existsSync(file)) return []

  const { paths = {} } = readJson(file).compilerOptions ?? {}
  return Object.entries(paths).flatMap(([alias, [target]]) =>
    target ? [[alias.replace(/\/?\*.*$/, ''), path.resolve(dir, target.replace(/\*.*$/, ''))]] : [],
  )
}

/** Reads package metadata from a directory. */
const readPackage = dir => {
  const file = path.join(dir, 'package.json')
  if (!fs.existsSync(file)) return null

  const manifest = readJson(file)
  return { aliases: readAliases(dir), deps: getDependencies(manifest), dir, name: manifest.name }
}

/** Reads packages directly inside a repository directory. */
const readPackages = parent =>
  fs
    .readdirSync(path.join(repoRoot, parent), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(({ name }) => readPackage(path.join(repoRoot, parent, name)))
    .filter(Boolean)

/** Checks whether a file is inside a directory. */
const isInside = (file, dir) => file === dir || file.startsWith(`${dir}${path.sep}`)

/** Extracts the npm package name from an import source. */
const getImportName = source => {
  if (!source || source.startsWith('.') || source.startsWith('node:') || path.isAbsolute(source)) return null
  if (builtinNames.has(source)) return null

  const [scope, name] = source.split('/')
  return scope.startsWith('@') ? `${scope}/${name}` : scope
}

const internalPackages = readPackages('packages')
const workspacePackages = [...readPackages('apps'), ...internalPackages, readPackage(path.join(repoRoot, 'tests'))]
  .filter(Boolean)
  .sort(({ dir: a }, { dir: b }) => b.length - a.length)
const packageAliases = new Map(
  internalPackages.flatMap(({ dir, name }) => [
    [name, name],
    [`@${path.basename(dir)}`, name],
  ]),
)

/** Matches an import source against an alias. */
const matchesAlias = (source, alias) => source === alias || source?.startsWith(`${alias}/`)

/** Resolves a package's TypeScript alias to a workspace. */
const resolveTsAlias = ({ aliases }, source) => {
  const [, target] = aliases.find(([alias]) => matchesAlias(source, alias)) ?? []
  return target && workspacePackages.find(({ dir }) => isInside(target, dir))?.name
}

/** Resolves internal shorthand aliases such as `@evm-ui`. */
const resolvePackageAlias = source => [...packageAliases].find(([alias]) => matchesAlias(source, alias))?.[1]

/** Resolves the package represented by an import source. */
const resolveImportName = (importer, source) =>
  resolveTsAlias(importer, source) ?? resolvePackageAlias(source) ?? getImportName(source)

/** Reads dependencies without requiring the package to export its manifest. */
const readDependencyDeps = (dir, dependency) => {
  try {
    const file = findPackageJSON(dependency, path.join(dir, 'package.json'))
    return file && getDependencies(readJson(file))
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return null
    throw error
  }
}

const allowedDepsByPackage = new Map()

/** Adds every reachable dependency to an import allowlist. */
const addDependencies = (allowed, dir, dependencies) => {
  dependencies.forEach(dependency => {
    if (allowed.has(dependency)) return

    allowed.add(dependency)
    addDependencies(allowed, dir, readDependencyDeps(dir, dependency) ?? [])
  })
}

/** Builds a package's transitive import allowlist. */
const getAllowedDeps = ({ deps, dir, name }) => {
  if (allowedDepsByPackage.has(name)) return allowedDepsByPackage.get(name)

  const allowed = new Set([name])
  addDependencies(allowed, dir, deps)
  allowedDepsByPackage.set(name, allowed)
  return allowed
}

/** Finds the workspace package containing a file. */
const getImporter = filename => {
  const file = path.resolve(filename)
  return workspacePackages.find(({ dir }) => isInside(file, dir))
}

/** Extracts an import source from a supported syntax node. */
const getSource = ({ argument, source }) => source?.value ?? argument?.value

/**
 * Enforces package dependency boundaries.
 * @type {eslint.Rule.Module}
 */
export const isolatedPackagesRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow imports outside a workspace package dependency boundary' },
    messages: {
      undeclaredDependency: '`{{importName}}` is not available to `{{packageName}}`; add it to its dependency tree.',
    },
  },
  /** Creates import visitors for one file. */
  create: context => {
    const { filename } = context
    const importer = getImporter(filename)
    const allowed = importer && getAllowedDeps(importer)

    /** Reports a source outside the importer's dependency boundary. */
    const checkSource = node => {
      if (!importer) return

      const importName = resolveImportName(importer, getSource(node))
      if (!importName || allowed.has(importName)) return

      const { argument, source } = node
      context.report({
        node: source ?? argument,
        messageId: 'undeclaredDependency',
        data: { importName, packageName: importer.name },
      })
    }

    return {
      ExportAllDeclaration: checkSource,
      ExportNamedDeclaration: checkSource,
      ImportDeclaration: checkSource,
      ImportExpression: checkSource,
      TSImportType: checkSource,
    }
  },
}
