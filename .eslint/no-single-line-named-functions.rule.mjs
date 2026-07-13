const isNamedFunction = node => node.type === 'FunctionDeclaration' || (node.type === 'FunctionExpression' && node.id)

const hasSingleLineBody = node =>
  node.body?.body.length === 1 && node.body.body[0].loc?.start.line === node.body.body[0].loc?.end.line

/**
 * Forbids one-line named functions. Prefer one-line arrow functions.
 *
 * @type {eslint.Rule.Module}
 */
export const noSingleLineNamedFunctionsRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow single-line named functions when an arrow function is enough' },
    messages: {
      preferArrow: 'Prefer a one-line arrow function instead of a named function.',
    },
  },
  create: context => ({
    ':function': node =>
      isNamedFunction(node) && hasSingleLineBody(node) && context.report({ node, messageId: 'preferArrow' }),
  }),
}
