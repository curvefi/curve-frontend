import ts from 'typescript'

const EXPRESSION_WRAPPERS = new Set([
  'ChainExpression',
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
])

const unwrap = node => (EXPRESSION_WRAPPERS.has(node?.type) ? unwrap(node.expression) : node)
const propertyName = node =>
  node.property.type === 'Identifier' && !node.computed
    ? node.property.name
    : node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string'
      ? node.property.value
      : null
const unionMembers = type => (type.isUnion() ? type.types : [type])
const isBoundedArrayLiteral = node =>
  node.type === 'ArrayExpression' &&
  node.elements.length > 0 &&
  node.elements.every(element => element && element.type !== 'SpreadElement')
const isFilterLength = node => {
  while (EXPRESSION_WRAPPERS.has(node.parent?.type)) node = node.parent
  return (
    node.parent?.type === 'MemberExpression' && node.parent.object === node && propertyName(node.parent) === 'length'
  )
}

const bigintLiteralIsZero = type => {
  const value = typeof type.value === 'object' ? type.value.base10Value : `${type.value}`
  return /^[-+]?0+$/.test(value)
}

const containsTypeParameter = type =>
  !!(type.flags & ts.TypeFlags.TypeParameter) ||
  ((type.isUnion() || type.isIntersection()) && type.types.some(containsTypeParameter))

/** True only for types whose runtime values cannot be falsy. */
const isDefinitelyTruthy = (checker, type) => {
  if (!type || containsTypeParameter(type)) return false
  const falsyTypes = [
    checker.getFalseType(),
    checker.getStringLiteralType(''),
    checker.getNumberLiteralType(0),
    checker.getBigIntLiteralType({ negative: false, base10Value: '0' }),
    checker.getNullType(),
    checker.getUndefinedType(),
  ]
  // A branded primitive can exclude its falsy literal structurally without doing so at runtime.
  if (
    type.isIntersection() &&
    falsyTypes.some(falsy => type.types.some(member => checker.isTypeAssignableTo(falsy, member)))
  )
    return false
  return falsyTypes.every(falsy => !checker.isTypeAssignableTo(falsy, type))
}

const isObviouslyTruthyExpression = node =>
  [
    'ArrayExpression',
    'ArrowFunctionExpression',
    'ClassExpression',
    'FunctionExpression',
    'NewExpression',
    'ObjectExpression',
  ].includes(unwrap(node).type)

/** Broad primitives do not make an unbounded receiver a compaction signal. */
const containsExplicitFalsy = type => {
  if (!type || type.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.TypeParameter)) return false
  if (type.isUnion()) return type.types.some(containsExplicitFalsy)
  if (type.isIntersection()) return false
  if (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void)) return true
  if (type.flags & ts.TypeFlags.BooleanLiteral) return type.intrinsicName === 'false'
  if (type.flags & ts.TypeFlags.StringLiteral) return type.value.length === 0
  if (type.flags & ts.TypeFlags.NumberLiteral) return type.value === 0 || Number.isNaN(type.value)
  if (type.flags & ts.TypeFlags.BigIntLiteral) return bigintLiteralIsZero(type)
  return false
}

const nullishMask = type =>
  unionMembers(type).reduce(
    (mask, member) =>
      mask |
      (member.flags & ts.TypeFlags.Null ? 1 : 0) |
      (member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void) ? 2 : 0),
    0,
  )

const isObjectsUtilsImport = source =>
  source === '@primitives/objects.utils' || source === './objects.utils' || source.endsWith('/objects.utils')

/** Reports safe, high-signal manual falsy compaction. */
export const useNotFalsyPatternRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `notFalsy` for safe, intentional falsy compaction' },
    messages: {
      compact: 'Use `notFalsy(...)` instead of filtering falsy values manually.',
      compactThenFilter: 'Compact with `notFalsy(...)` before applying the remaining filter predicate.',
      conditional: 'Use `notFalsy(...)` instead of conditionally producing a singleton array.',
      redundant: '`notFalsy(...)` already removes falsy values; remove this filter.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode
    const services = sourceCode.parserServices
    if (!services?.program || !services.esTreeNodeToTSNodeMap) return {}

    const checker = services.program.getTypeChecker()
    const inObjectsUtils = context.filename
      .replaceAll('\\', '/')
      .toLowerCase()
      .endsWith('/packages/primitives/src/objects.utils.ts')

    const findVariable = (node, name) => {
      for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
        const variable = scope.set?.get(name)
        if (variable) return variable
      }
    }
    const isGlobal = (node, name) => {
      const variable = findVariable(node, name)
      return !variable || variable.defs.length === 0
    }
    const getType = node => checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node))
    const getElementType = receiver => {
      const type = getType(receiver)
      const isArray = member => {
        const apparent = checker.getApparentType(member)
        return checker.isArrayType(apparent) || checker.isTupleType(apparent)
      }
      return unionMembers(type).every(isArray) ? checker.getIndexTypeOfType(type, ts.IndexKind.Number) : undefined
    }

    const isReference = node => {
      node = unwrap(node)
      return node.type === 'Identifier' || node.type === 'ThisExpression'
    }
    const sameExpression = (left, right) => sourceCode.getText(unwrap(left)) === sourceCode.getText(unwrap(right))

    /** `true` means the test is true exactly when value is truthy; `false` means the inverse. */
    const truthinessPolarity = (test, value) => {
      test = unwrap(test)
      value = unwrap(value)
      if (isReference(value) && sameExpression(test, value)) return true
      if (test.type === 'UnaryExpression' && test.operator === '!') {
        const inner = truthinessPolarity(test.argument, value)
        return inner === undefined ? undefined : !inner
      }
      if (
        test.type === 'CallExpression' &&
        !test.optional &&
        test.arguments.length === 1 &&
        test.callee.type === 'Identifier' &&
        test.callee.name === 'Boolean' &&
        isGlobal(test.callee, 'Boolean') &&
        isReference(value) &&
        sameExpression(test.arguments[0], value)
      )
        return true
    }

    const flattenAnd = node => {
      node = unwrap(node)
      return node.type === 'LogicalExpression' && node.operator === '&&'
        ? [...flattenAnd(node.left), ...flattenAnd(node.right)]
        : [node]
    }
    const nullishGuardMask = (node, parameterName) => {
      node = unwrap(node)
      if (node.type !== 'BinaryExpression' || !['!=', '!=='].includes(node.operator)) return 0
      const left = unwrap(node.left)
      const right = unwrap(node.right)
      const compared =
        left.type === 'Identifier' && left.name === parameterName
          ? right
          : right.type === 'Identifier' && right.name === parameterName
            ? left
            : undefined
      if (!compared) return 0
      const isNull = compared.type === 'Literal' && compared.value === null
      const isUndefined =
        compared.type === 'Identifier' && compared.name === 'undefined' && isGlobal(compared, 'undefined')
      if (!isNull && !isUndefined) return 0
      return node.operator === '!=' ? 3 : isNull ? 1 : 2
    }

    const classifyCallback = (callback, elementType) => {
      if (
        callback.type !== 'ArrowFunctionExpression' ||
        callback.async ||
        callback.params.length !== 1 ||
        callback.params[0].type !== 'Identifier' ||
        callback.body.type === 'BlockStatement'
      )
        return undefined

      const parameter = callback.params[0]
      const operands = flattenAnd(callback.body)
      let guardCount = truthinessPolarity(operands[0], parameter) === true ? 1 : 0
      if (!guardCount) {
        const required = nullishMask(elementType)
        let removed = 0
        for (const operand of operands) {
          const mask = nullishGuardMask(operand, parameter.name)
          if (!mask) break
          removed |= mask
          guardCount++
          if ((removed & required) === required) break
        }
        if (
          !required ||
          (removed & required) !== required ||
          !isDefinitelyTruthy(checker, checker.getNonNullableType(elementType))
        )
          return undefined
      }
      return guardCount < operands.length ? 'compound' : 'direct'
    }

    const isGlobalBoolean = node => node.type === 'Identifier' && node.name === 'Boolean' && isGlobal(node, 'Boolean')
    const importDefinition = node =>
      node.type === 'Identifier'
        ? findVariable(node, node.name)?.defs.find(
            definition =>
              definition.type === 'ImportBinding' &&
              definition.parent.type === 'ImportDeclaration' &&
              definition.parent.importKind !== 'type' &&
              isObjectsUtilsImport(definition.parent.source.value),
          )
        : undefined
    const isImportedNotFalsyCall = node => {
      if (node.type !== 'CallExpression') return false
      if (node.callee.type === 'Identifier') {
        const definition = importDefinition(node.callee)
        return (
          definition?.node.type === 'ImportSpecifier' &&
          definition.node.importKind !== 'type' &&
          (definition.node.imported.name === 'notFalsy' || definition.node.imported.value === 'notFalsy')
        )
      }
      if (node.callee.type !== 'MemberExpression' || propertyName(node.callee) !== 'notFalsy') return false
      const object = unwrap(node.callee.object)
      return importDefinition(object)?.node.type === 'ImportNamespaceSpecifier'
    }
    const isOwnImplementation = node => {
      if (!inObjectsUtils) return false
      for (let parent = node.parent; parent; parent = parent.parent)
        if (parent.type === 'VariableDeclarator')
          return parent.id.type === 'Identifier' && parent.id.name === 'notFalsy'
      return false
    }

    const conditionalParts = node => {
      const consequentEmpty = node.consequent.type === 'ArrayExpression' && node.consequent.elements.length === 0
      const alternateEmpty = node.alternate.type === 'ArrayExpression' && node.alternate.elements.length === 0
      if (consequentEmpty === alternateEmpty) return undefined
      const included = consequentEmpty ? node.alternate : node.consequent
      if (
        included.type !== 'ArrayExpression' ||
        included.elements.length !== 1 ||
        !included.elements[0] ||
        included.elements[0].type === 'SpreadElement'
      )
        return undefined
      return { element: included.elements[0], includeOnTestTrue: !consequentEmpty }
    }

    return {
      CallExpression(node) {
        if (
          node.optional ||
          node.callee.type !== 'MemberExpression' ||
          node.callee.optional ||
          propertyName(node.callee) !== 'filter' ||
          node.arguments.length !== 1 ||
          isFilterLength(node)
        )
          return

        const receiver = node.callee.object
        const arrayLiteral = unwrap(receiver)
        if (arrayLiteral.type === 'ArrayExpression' && !isBoundedArrayLiteral(arrayLiteral)) return
        const elementType = getElementType(receiver)
        if (!elementType) return

        const callback = unwrap(node.arguments[0])
        if (isGlobalBoolean(callback) && isOwnImplementation(node)) return
        if (isGlobalBoolean(callback) && isImportedNotFalsyCall(arrayLiteral)) {
          context.report({ node, messageId: 'redundant' })
          return
        }
        if (!isBoundedArrayLiteral(arrayLiteral) && !containsExplicitFalsy(elementType)) return

        const predicate = isGlobalBoolean(callback) ? 'direct' : classifyCallback(callback, elementType)
        if (predicate) context.report({ node, messageId: predicate === 'compound' ? 'compactThenFilter' : 'compact' })
      },

      ConditionalExpression(node) {
        const parts = conditionalParts(node)
        if (!parts) return
        const polarity = truthinessPolarity(node.test, parts.element)
        const sameTruthyValue = polarity !== undefined && polarity === parts.includeOnTestTrue
        if (
          sameTruthyValue ||
          isObviouslyTruthyExpression(parts.element) ||
          isDefinitelyTruthy(checker, getType(parts.element))
        )
          context.report({ node, messageId: 'conditional' })
      },
    }
  },
}
