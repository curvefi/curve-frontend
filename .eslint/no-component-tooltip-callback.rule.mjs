/**
 * Tooltip callbacks run outside React rendering, so components must be rendered through JSX.
 * @type {eslint.Rule.Module}
 */
export const noComponentTooltipCallbackRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow passing React components directly as tooltip callbacks' },
    messages: { component: 'Render tooltip components through JSX inside a callback so React can run their hooks.' },
  },
  create: context => {
    const reportComponent = node => {
      const name =
        node?.type === 'Identifier'
          ? node.name
          : node?.type === 'MemberExpression' && !node.computed
            ? node.property.name
            : ''
      if (/^[A-Z]/.test(name)) context.report({ node, messageId: 'component' })
    }

    return {
      'JSXAttribute[name.name="renderTooltip"]': node => reportComponent(node.value?.expression),
      'CallExpression[callee.name="useEChartsTooltip"]': node => reportComponent(node.arguments[2]),
    }
  },
}
