const routerHookImport = '@ui-kit/hooks/router'
const unwrapTypes = [
  'ChainExpression',
  'TSAsExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
  'TypeCastExpression',
]
const functionTypes = ['ArrowFunctionExpression', 'FunctionDeclaration', 'FunctionExpression']

const isFunction = node => functionTypes.includes(node?.type)

/** Removes TypeScript/parser wrapper nodes from an expression. */
const unwrapExpression = node => (unwrapTypes.includes(node?.type) ? unwrapExpression(node.expression) : node)

/** Returns a function's local binding name when it has one. */
const getFunctionName = ({ id, parent }) =>
  parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier'
    ? parent.id.name
    : parent?.type === 'Property' && parent.key.type === 'Identifier'
      ? parent.key.name
      : id?.name

/** Returns the function stored in a variable, including `useCallback(() => ...)`. */
const getStoredFunction = init => {
  const expression = unwrapExpression(init)
  const callback = expression?.type === 'CallExpression' ? unwrapExpression(expression.arguments[0]) : null

  return isFunction(expression)
    ? expression
    : expression?.callee?.name === 'useCallback' && isFunction(callback)
      ? callback
      : null
}

/** Returns direct AST children, excluding parser parent links. */
const getChildNodes = node =>
  Object.entries(node)
    .filter(([key]) => key !== 'parent')
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter(child => child?.type)

/** Returns true when `callback` matches this node or one of its descendants. */
const someNode = (node, callback) =>
  Boolean(node?.type && (callback(node) || getChildNodes(node).some(child => someNode(child, callback))))

/**
 * Forbids router navigation from `onClick` handlers. Use links for navigation instead.
 * @type {eslint.Rule.Module}
 **/
export const noRouterNavigateOnClickRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow router navigate calls from onClick handlers' },
    messages: { navigateOnClick: 'Use a link instead of calling router navigate from an `onClick` handler.' },
  },
  create: context => {
    const useNavigateNames = new Set(['useNavigate'])
    const navigateNames = new Set()
    const functions = new Map()

    /** `true` when `node` calls router navigate directly or through a known local helper. */
    const containsNavigate = (node, seen = new Set()) =>
      someNode(node, child => {
        const { arguments: args = [], callee, name, type } = unwrapExpression(child)
        const helperName = type === 'CallExpression' && callee.type === 'Identifier' ? callee.name : name
        const helper = helperName && functions.get(helperName)
        const shouldCheckHelper = helper && !seen.has(helperName)
        const callsNavigate =
          type === 'CallExpression' && callee.type === 'Identifier' && navigateNames.has(callee.name)
        const passesNavigate =
          type === 'CallExpression' && args.some(arg => arg.type === 'Identifier' && navigateNames.has(arg.name))

        if (!shouldCheckHelper) return callsNavigate || passesNavigate

        seen.add(helperName)
        return callsNavigate || passesNavigate || containsNavigate(helper, seen)
      })

    /** Reports JSX `onClick` attributes whose expression reaches router navigate. */
    const reportOnClick = node => {
      const value = unwrapExpression(node.value?.expression)
      if (value && containsNavigate(value)) context.report({ node, messageId: 'navigateOnClick' })
    }

    return {
      ImportDeclaration: ({ source, specifiers }) => {
        if (source.value !== routerHookImport) return

        specifiers
          .filter(({ imported, type }) => type === 'ImportSpecifier' && imported.name === 'useNavigate')
          .forEach(({ local }) => useNavigateNames.add(local.name))
      },
      VariableDeclarator: ({ id, init }) => {
        const expression = unwrapExpression(init)
        const storedFunction = id.type === 'Identifier' && getStoredFunction(expression)
        if (storedFunction) functions.set(id.name, storedFunction)
        if (
          id.type === 'Identifier' &&
          expression?.type === 'CallExpression' &&
          expression.callee.type === 'Identifier' &&
          useNavigateNames.has(expression.callee.name)
        ) {
          navigateNames.add(id.name)
        }
      },
      ':function': node => {
        const name = getFunctionName(node)
        if (name) functions.set(name, node)
      },
      JSXAttribute: node => {
        if (node.name.name === 'onClick' && node.value?.type === 'JSXExpressionContainer') reportOnClick(node)
      },
    }
  },
}
