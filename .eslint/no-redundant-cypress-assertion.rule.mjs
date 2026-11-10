/**
 * Forbids enabled assertions immediately followed by an action that checks enabledness.
 * @type {eslint.Rule.Module}
 */
export const noRedundantCypressAssertionRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow redundant enabled assertions before Cypress actions' },
    messages: { redundant: 'Remove the enabled assertion; Cypress already checks enabledness before this action.' },
  },
  create: context => ({
    CallExpression: ({ callee: { computed, object: assertion, property, type } }) => {
      type === 'MemberExpression' && // plain function calls have no property or object
        !computed && // skip bracket access: .property.name could be a variable, as in [click]()
        ['click', 'dblclick', 'rightclick', 'type', 'clear'].includes(property.name) &&
        assertion.type === 'CallExpression' && // only inspect the call immediately before the action
        assertion.callee.type === 'MemberExpression' &&
        !assertion.callee.computed &&
        ['should', 'and'].includes(assertion.callee.property.name) &&
        ['be.enabled', 'not.be.disabled'].includes(assertion.arguments[0]?.value) &&
        context.report({ node: assertion, messageId: 'redundant' })
    },
  }),
}
