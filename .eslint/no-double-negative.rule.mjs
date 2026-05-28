/**
 * Forbids negated conditions with two swappable branches like `!x ? a : b` and `if (!x) {} else {}`.
 * @type {eslint.Rule.Module}
 **/
export const noDoubleNegativeRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow negated conditions in ternary expressions and if statements' },
    messages: { negated: 'Double-negatives are hard to read. Swap the branches and remove the `!`.' },
  },
  create: context => {
    const reportNegatedCondition = ({ test }) =>
      test.type === 'UnaryExpression' && test.operator === '!' && context.report({ node: test, messageId: 'negated' })
    return {
      ConditionalExpression: reportNegatedCondition,
      IfStatement: node => node.alternate?.type !== 'IfStatement' && node.alternate && reportNegatedCondition(node),
    }
  },
}
