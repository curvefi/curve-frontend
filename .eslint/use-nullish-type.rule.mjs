import path from 'node:path'

/** Flatten parenthesized unions without traversing other type constructs. */
const unionMembers = node => (node.type === 'TSUnionType' ? node.types.flatMap(unionMembers) : [node])
const isNullish = node => ['TSNullKeyword', 'TSUndefinedKeyword'].includes(node.type)

const findVariable = (scope, name) => scope && (scope.set.get(name) ?? findVariable(scope.upper, name))

/** Keep type expressions parenthesized when rebuilding a union. */
const getTypeText = (source, node) =>
  ['TSFunctionType', 'TSConstructorType', 'TSConditionalType'].includes(node.type)
    ? `(${source.getText(node)})`
    : source.getText(node)

const importSource = filename => {
  const root = '/packages/primitives/src/'
  if (!filename.includes(root)) return '@primitives/objects.utils'
  const relative = path.posix.relative(path.posix.dirname(filename), `${filename.split(root)[0]}${root}objects.utils`)
  return relative.startsWith('.') ? relative : `./${relative}`
}

/**
 * Require the shared Nullish type whenever a union includes both null and undefined.
 * @type {eslint.Rule.Module}
 */
export const useNullishTypeRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require Nullish instead of explicit null and undefined union members' },
    schema: [],
    fixable: 'code',
    messages: { useNullish: 'Use `Nullish` from @primitives/objects.utils instead of `null | undefined`.' },
  },
  create: context => {
    const source = context.sourceCode
    const filename = context.filename.replaceAll('\\', '/')
    const inObjectsUtils = filename.endsWith('/packages/primitives/src/objects.utils.ts')
    const moduleName = importSource(filename)
    const imports = source.ast.body.filter(statement => statement.type === 'ImportDeclaration')
    const existing = imports.find(statement => statement.source.value === moduleName)
    const specifier = existing?.specifiers.find(
      specifier => specifier.type === 'ImportSpecifier' && specifier.imported.name === 'Nullish',
    )
    const name = specifier?.local.name ?? 'Nullish'

    const definition =
      specifier ??
      (inObjectsUtils &&
        source.ast.body
          .filter(({ type }) => type === 'ExportNamedDeclaration')
          .map(({ declaration }) => declaration)
          .find(declaration => declaration?.type === 'TSTypeAliasDeclaration' && declaration.id.name === name))

    const addImport = fixer => {
      if (specifier || inObjectsUtils) return []
      const named = existing?.specifiers.find(({ type }) => type === 'ImportSpecifier')
      if (named) return [fixer.insertTextBefore(named, `${existing.importKind === 'type' ? '' : 'type '}Nullish, `)]
      const declaration = `import type { Nullish } from '${moduleName}'`
      return [
        imports.length
          ? fixer.insertTextAfter(imports.at(-1), `\n${declaration}`)
          : fixer.insertTextBefore(source.ast.body[0], `${declaration}\n`),
      ]
    }

    return {
      TSUnionType: node => {
        if (node.parent.type === 'TSUnionType') return
        const members = unionMembers(node)
        const nullish = members.filter(isNullish)
        if (new Set(nullish.map(({ type }) => type)).size !== 2) return

        context.report({
          node,
          messageId: 'useNullish',
          fix(fixer) {
            // Leave commented unions and shadowed names for manual correction.
            if (source.getCommentsInside(node).length) return null
            const variable = findVariable(source.getScope(node), name)
            if (definition) {
              if (node.parent === definition || !variable?.defs.some(def => def.node === definition)) return null
            } else if (inObjectsUtils || variable) return null

            const replacement = members
              .filter(member => !isNullish(member) || member === nullish[0])
              .map(member => (isNullish(member) ? name : getTypeText(source, member)))
              .join(' | ')
            return [fixer.replaceText(node, replacement), ...addImport(fixer)]
          },
        })
      },
    }
  },
}
