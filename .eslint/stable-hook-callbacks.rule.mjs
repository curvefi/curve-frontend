/**
 * Hooks whose callback arguments are used as memo/effect dependencies.
 * Inline render-scope callbacks defeat that caching and can retrigger side effects.
 */
const hooksWithStableCallbacks = {
  useCallbackSync: { callbackIndex: 1 },
  useCombinedQueries: { callbackIndex: 1 },
  useMappedQuery: { callbackIndex: 1 },
  useOhlcPagesAdapter: { objectIndex: 0, propertyName: 'selectData' },
  useOhlcQueryAdapter: { objectIndex: 0, propertyName: 'selectItems' },
}

/** Removes TypeScript and parser wrapper nodes so checks can inspect the underlying expression. */
const unwrapExpression = node => {
  let current = node
  while (
    ['ChainExpression', 'TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TypeCastExpression'].includes(
      current.type,
    )
  )
    current = current.expression
  return current
}

/** Returns true for direct `useCallback(...)` calls. */
const isUseCallbackCall = node => {
  if (!node) return false
  const expression = unwrapExpression(node)
  if (expression?.type !== 'CallExpression') return false
  const { name, type } = unwrapExpression(expression.callee)
  return type === 'Identifier' && name === 'useCallback'
}

const isModuleScopeDefinition = variable => ['global', 'module'].includes(variable?.scope.type)

const isParameterDefinition = variable => variable?.defs.some(({ type }) => type === 'Parameter')

/** Finds a variable by walking from the current ESLint scope up to parent scopes. */
const findVariable = (scope, name) => {
  let current = scope
  while (current) {
    const variable = current.variables.find(({ name: variableName }) => variableName === name)
    if (variable) return variable
    current = current.upper
  }
  return null
}

const isIdentifierAllowed = (context, node) => {
  const variable = findVariable(context.sourceCode.getScope(node), node.name)
  const init = variable?.defs.find(({ node: defNode }) => defNode.type === 'VariableDeclarator')?.node.init
  return isParameterDefinition(variable) || isUseCallbackCall(init) || isModuleScopeDefinition(variable)
}

const getStableCallbackHook = ({ callee }, localHookNames) =>
  callee.type === 'Identifier' ? localHookNames.get(callee.name) : null

const getPropertyName = ({ computed, key }) =>
  key.type === 'Identifier' && !computed ? key.name : key.type === 'Literal' ? key.value : null

/** Reads callbacks passed as object properties, e.g. `useOhlcPagesAdapter({ selectData })`. */
const getObjectCallback = (argument, propertyName) => {
  const object = unwrapExpression(argument)
  if (object?.type !== 'ObjectExpression') return null

  const property = object.properties.find(p => p.type === 'Property' && getPropertyName(p) === propertyName)
  return property?.type === 'Property' ? unwrapExpression(property.value) : null
}

const getCallback = ({ arguments: args }, { callbackIndex, objectIndex, propertyName }) =>
  propertyName ? getObjectCallback(args[objectIndex], propertyName) : unwrapExpression(args[callbackIndex])

/**
 * Requires selected hook callbacks to be stable across renders.
 * Allows `useCallback(...)`, variables initialized from `useCallback(...)`, module-scope callbacks, and params.
 *
 * @type {eslint.Rule.Module}
 **/
export const stableHookCallbacksRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require callbacks passed to memoizing hooks to be wrapped in useCallback or defined in module scope',
    },
    messages: {
      unstable:
        'Pass a `useCallback(...)` result or a module-scope callback to `{{hookName}}`; render-scope callbacks invalidate its memoization.',
    },
  },
  create: context => {
    const localHookNames = new Map(Object.entries(hooksWithStableCallbacks))
    return {
      ImportSpecifier(node) {
        const hook = hooksWithStableCallbacks[node.imported.name]
        if (hook) localHookNames.set(node.local.name, hook)
      },
      CallExpression(node) {
        const hook = getStableCallbackHook(node, localHookNames)
        const callback = hook && getCallback(node, hook)
        if (
          callback &&
          !isUseCallbackCall(callback) &&
          (callback.type !== 'Identifier' || !isIdentifierAllowed(context, callback))
        ) {
          context.report({
            node: callback,
            messageId: 'unstable',
            data: { hookName: context.sourceCode.getText(node.callee) },
          })
        }
      },
    }
  },
}
