const jsxAttributeEscapes = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '{': '&#123;',
  '}': '&#125;',
  '\n': '&#10;',
  '\r': '&#13;',
  '\t': '&#9;',
}

/**
 * Converts a JavaScript string literal value into equivalent JSX attribute text.
 * JSX quoted attributes must not contain unescaped delimiters or expression markers,
 * otherwise the autofix could change parsing or produce invalid JSX.
 */
const escapeJsxAttributeValue = value => value.replace(/[&"<{}\n\r\t]/g, char => jsxAttributeEscapes[char])

/**
 * Forbids JSX string attributes wrapped in expression braces, like `prop={'value'}`.
 * @type {eslint.Rule.Module}
 **/
export const noJsxStringLiteralBracesRule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: { description: 'Disallow unnecessary braces around JSX string attributes' },
    messages: { unnecessary: 'Use `{{name}}="{{value}}"` instead of `{{name}}={{{source}}}`.' },
  },
  create: context => ({
    JSXAttribute(node) {
      if (
        node.value?.type !== 'JSXExpressionContainer' ||
        node.value.expression.type !== 'Literal' ||
        typeof node.value.expression.value !== 'string'
      )
        return

      const { expression } = node.value
      const value = escapeJsxAttributeValue(expression.value)
      context.report({
        node: node.value,
        messageId: 'unnecessary',
        data: { name: context.sourceCode.getText(node.name), value, source: context.sourceCode.getText(expression) },
        fix: fixer => fixer.replaceText(node.value, `"${value}"`),
      })
    },
  }),
}
