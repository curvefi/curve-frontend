const mutableArrayMethods = new Map([
  ['copyWithin', 'copy with `toSpliced`, `slice`, or another immutable transform instead'],
  ['fill', 'create a new filled array instead'],
  ['pop', 'use `slice(0, -1)` or destructuring instead'],
  ['push', 'use a spread append like `[...array, item]` instead'],
  ['reverse', 'use `toReversed()` instead'],
  ['shift', 'use `slice(1)` or destructuring instead'],
  ['sort', 'use `toSorted()` instead'],
  ['splice', 'use `toSpliced()` instead'],
  ['unshift', 'use a spread prepend like `[item, ...array]` instead'],
])

const getPropertyName = ({ computed, property }) =>
  property.type === 'Identifier' && !computed
    ? property.name
    : computed && property.type === 'Literal' && typeof property.value === 'string'
      ? property.value
      : null

/**
 * Checks if type is an Array or tuple, including union members and aliases whose type exposes the underlying array shape.
 */
const isArrayLikeType = (checker, type) => {
  if (type.isUnion()) return type.types.some(unionType => isArrayLikeType(checker, unionType))
  const apparentType = checker.getApparentType(type)
  return checker.isArrayType(apparentType) || checker.isTupleType(apparentType)
}

const getNodeType = (services, checker, node) => {
  const tsNode = services.esTreeNodeToTSNodeMap?.get(node)
  return tsNode ? checker.getTypeAtLocation(tsNode) : null
}

/**
 * Disallows mutable Array methods when TypeScript can identify the receiver as
 * an Array or tuple.
 *
 * @type {eslint.Rule.Module}
 */
export const noMutableArrayMethodsRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow mutable Array methods in favor of immutable alternatives' },
    messages: { mutableArrayMethod: 'Do not mutate arrays with `{{method}}`; {{suggestion}}.' },
  },
  create: context => ({
    CallExpression: ({ callee }) => {
      const services = context.sourceCode.parserServices
      const checker = services.program.getTypeChecker()

      if (callee.type !== 'MemberExpression') return

      const method = getPropertyName(callee)
      const suggestion = mutableArrayMethods.get(method)
      if (!suggestion) return

      const receiverType = getNodeType(services, checker, callee.object)
      if (!receiverType || !isArrayLikeType(checker, receiverType)) return

      context.report({ node: callee.property, messageId: 'mutableArrayMethod', data: { method, suggestion } })
    },
  }),
}
