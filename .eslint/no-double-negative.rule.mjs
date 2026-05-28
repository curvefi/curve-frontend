/**
 * Forbids negated conditions with two swappable branches like `!x ? a : b` and `if (!x) {} else {}`.
 * It ignores statements without an `else` branch and ignores `else if` statements.
 * @type {eslint.Rule.Module}
 **/
export const noDoubleNegativeRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow negated conditions in ternary expressions and if statements' },
    messages: { negated: 'Double-negatives are hard to read. Swap the branches and remove the `!`.' },
  },
  create: context => {
    const isNegated = ({ operator, type }) => type === 'UnaryExpression' && operator === '!'
    const reportNegatedCondition = ({ test }) => isNegated(test) && context.report({ node: test, messageId: 'negated' })
    return {
      ConditionalExpression: reportNegatedCondition,
      IfStatement: node => node.alternate && node.alternate.type !== 'IfStatement' && reportNegatedCondition(node),
    }
  },
}
