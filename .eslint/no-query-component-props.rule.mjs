const isComponentName = name => /^[A-Z]/.test(name)

const typeName = node => (node?.type === 'Identifier' ? node.name : null)

const isComponentFunction = node => ['ArrowFunctionExpression', 'FunctionExpression'].includes(node?.type)

const isQueryType = node => node?.type === 'TSTypeReference' && typeName(node.typeName) === 'Query'

const getPropsAnnotation = param => param?.typeAnnotation?.typeAnnotation

const getPropsTypeName = param => {
  const annotation = getPropsAnnotation(param)
  return annotation?.type === 'TSTypeReference' ? typeName(annotation.typeName) : null
}

const visitTypeNodes = (node, callback) => {
  if (!node || typeof node.type !== 'string') return
  callback(node)

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue
    if (Array.isArray(value)) value.forEach(child => visitTypeNodes(child, callback))
    else if (value && typeof value.type === 'string') visitTypeNodes(value, callback)
  }
}

const reportQueryProps = (context, node) => {
  if (!node) return
  visitTypeNodes(
    node,
    child =>
      isQueryType(child) &&
      context.report({
        node: child,
        messageId: 'queryProp',
      }),
  )
}

/**
 * Forbids `Query<>` in React component props. Helpers and hooks may still use `Query<>`.
 * @type {eslint.Rule.Module}
 **/
export const noQueryComponentPropsRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow Query<> in React component props; use QueryProp<> instead' },
    messages: { queryProp: 'Use `QueryProp<>` for React component props instead of `Query<>`.' },
  },
  create: context => {
    const propsTypes = new Map()
    const componentProps = new Set()

    const trackComponent = (name, params) => {
      if (!isComponentName(name)) return

      const propsName = getPropsTypeName(params[0])
      if (propsName) componentProps.add(propsName)
      else reportQueryProps(context, getPropsAnnotation(params[0]))
    }

    return {
      TSTypeAliasDeclaration: node => propsTypes.set(node.id.name, node.typeAnnotation),
      TSInterfaceDeclaration: node => propsTypes.set(node.id.name, node),
      FunctionDeclaration: node => trackComponent(node.id?.name, node.params),
      VariableDeclarator: node =>
        node.id.type === 'Identifier' && isComponentFunction(node.init) && trackComponent(node.id.name, node.init.params),
      'Program:exit': () => componentProps.forEach(name => reportQueryProps(context, propsTypes.get(name))),
    }
  },
}
