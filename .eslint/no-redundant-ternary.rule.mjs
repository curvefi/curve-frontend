/**
 * Check if two AST nodes are structurally equivalent.
 * @return true if both nodes represent the same source code structure.
 **/
const areNodesEqual = (node1, node2) => {
  if (!node1 || !node2) return node1 === node2
  if (node1.type !== node2.type) return false
  switch (node1.type) {
    case 'Identifier':
      return node1.name === node2.name
    case 'Literal':
      return node1.value === node2.value
    case 'MemberExpression':
      return (
        areNodesEqual(node1.object, node2.object) &&
        areNodesEqual(node1.property, node2.property) &&
        node1.computed === node2.computed
      )
    case 'ChainExpression':
      return areNodesEqual(node1.expression, node2.expression)
    case 'CallExpression':
      return (
        areNodesEqual(node1.callee, node2.callee) &&
        node1.arguments.length === node2.arguments.length &&
        node1.arguments.every((arg, i) => areNodesEqual(arg, node2.arguments[i]))
      )
    case 'ArrayExpression':
      return (
        node1.elements.length === node2.elements.length &&
        node1.elements.every((el, i) => areNodesEqual(el, node2.elements[i]))
      )
    case 'ObjectExpression':
      return (
        node1.properties.length === node2.properties.length &&
        node1.properties.every((prop, i) => areNodesEqual(prop, node2.properties[i]))
      )
    case 'Property':
      return areNodesEqual(node1.key, node2.key) && areNodesEqual(node1.value, node2.value)
    case 'UnaryExpression':
      return node1.operator === node2.operator && areNodesEqual(node1.argument, node2.argument)
    case 'BinaryExpression':
    case 'LogicalExpression':
      return (
        node1.operator === node2.operator &&
        areNodesEqual(node1.left, node2.left) &&
        areNodesEqual(node1.right, node2.right)
      )
    case 'ConditionalExpression':
      return (
        areNodesEqual(node1.test, node2.test) &&
        areNodesEqual(node1.consequent, node2.consequent) &&
        areNodesEqual(node1.alternate, node2.alternate)
      )
    default:
      return false
  }
}

/**
 * Forbids redundant ternary patterns like `x ? x : y`, which should be `x || y`.
 * @type {eslint.Rule.Module}
 */
export const noRedundantTernaryRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow redundant ternary expressions that can be simplified to logical OR' },
    messages: { redundant: 'Prefer `{{test}} || {{alternate}}` instead of `{{test}} ? {{test}} : {{alternate}}`.' },
  },
  create: context => ({
    ConditionalExpression(node) {
      const { test, consequent, alternate } = node
      // Only report if test and consequent are identical
      if (areNodesEqual(test, consequent)) {
        context.report({
          node,
          messageId: 'redundant',
          data: { test: context.sourceCode.getText(test), alternate: context.sourceCode.getText(alternate) },
        })
      }
    },
  }),
}
