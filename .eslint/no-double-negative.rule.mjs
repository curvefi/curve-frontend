/** Forbids negated ternary conditions like `!x ? a : b`, which should be `x ? b : a`. */
export const noDoubleNegativeRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow negated conditions in ternary expressions' },
    messages: { negated: 'Negated ternary conditions are hard to read. Swap the branches and remove the `!`.' },
  },
  create: context => ({
    ConditionalExpression: ({ test }) =>
      test.type === 'UnaryExpression' && test.operator === '!' && context.report({ node: test, messageId: 'negated' }),
  }),
}
