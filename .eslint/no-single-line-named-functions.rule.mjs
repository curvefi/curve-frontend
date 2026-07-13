const isNamedFunction = node => node.type === 'FunctionDeclaration' || (node.type === 'FunctionExpression' && node.id)

const hasSingleLineBody = node =>
  node.body?.body.length === 1 && node.body.body[0].loc?.start.line === node.body.body[0].loc?.end.line

const containsThisExpression = (sourceCode, node) =>
  sourceCode.getTokens(node.body).some(token => token.type === 'Keyword' && token.value === 'this')

/**
 * Forbids one-line named functions. Prefer one-line arrow functions unless a function `this` binding is needed.
 *
 * @type {eslint.Rule.Module}
 */
export const noSingleLineNamedFunctionsRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow single-line named functions when an arrow function is enough' },
    messages: {
      preferArrow:
        'Prefer a one-line arrow function instead of a named function. Use a named function only when it needs its own `this` binding.',
    },
  },
  create: context => ({
    ':function': node =>
      isNamedFunction(node) &&
      hasSingleLineBody(node) &&
      !containsThisExpression(context.sourceCode, node) &&
      context.report({ node, messageId: 'preferArrow' }),
  }),
}
