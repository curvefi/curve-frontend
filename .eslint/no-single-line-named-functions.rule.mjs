/**
 * Forbids named functions with a single statement. Prefer inlined arrow functions.
 * @type {eslint.Rule.Module}
 */
export const noSingleLineNamedFunctionsRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow named functions with a single statement when an inline arrow function is enough' },
    messages: { preferArrow: 'Prefer inline arrow functions.' },
  },
  create: context => ({
    'FunctionDeclaration, FunctionExpression': node =>
      node.parent?.type !== 'MethodDefinition' && // ignore class methods
      node.parent?.callee?.name !== 'forwardRef' && // React's forwardRef requires a named function
      !node.parent?.body?.some(sibling => sibling.type === 'TSDeclareFunction' && sibling.id?.name === node.id?.name) && // ignore overloaded functions
      node.body?.body.length === 1 && // only one statement
      ['ExpressionStatement', 'ReturnStatement'].includes(node.body.body[0].type) && // not a block statement
      !context.sourceCode.getTokens(node.body).some(({ value }) => value === 'this') && // cannot inline when using `this`
      context.report({ node, messageId: 'preferArrow' }),
  }),
}
