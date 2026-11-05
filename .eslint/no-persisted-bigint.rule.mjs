import ts from 'typescript'

/** Find nested bigint types; ancestors stop recursive types such as Node = { next?: Node }. */
const hasBigint = (checker, type, location, ancestors = []) => {
  if (!type || ancestors.includes(type)) return false
  if (type.flags & ts.TypeFlags.BigIntLike) return true
  const visit = child => hasBigint(checker, child, location, [...ancestors, type])
  if (type.isUnionOrIntersection()) return type.types.some(visit)
  if (!(type.flags & ts.TypeFlags.Object)) return false
  return (
    checker.getIndexInfosOfType(type).some(({ type }) => visit(type)) ||
    checker.getPropertiesOfType(type).some(property => visit(checker.getTypeOfSymbolAtLocation(property, location)))
  )
}

/**
 * JSON persistence rejects bigint: { queryFn: async () => 1n, select: String } still caches 1n.
 * Check queryFn's result (or Wagmi's select input), unless persistence is disabled.
 * Direct cache writes and bigint hidden by any/unknown are not tracked.
 * @type {eslint.Rule.Module}
 */
export const noPersistedBigintRule = {
  meta: {
    type: 'problem',
    schema: [],
    docs: { description: 'Disallow bigint in persisted query data' },
    messages: { bigint: 'Query data contains bigint. Convert it before caching or disable persistence.' },
  },
  create: context => ({
    CallExpression: node => {
      const services = context.sourceCode.parserServices
      const checker = services.program.getTypeChecker()
      const call = services.esTreeNodeToTSNodeMap.get(node)
      const declaration = checker.getResolvedSignature(call)?.declaration
      const source = declaration?.getSourceFile().fileName ?? ''
      const functionName = declaration?.name?.getText()
      // Use the original declaration so aliased imports still match.
      const isWagmiHook = source.includes('/wagmi/') && functionName?.startsWith('use')
      const isQueryCall =
        ['queryFactory', 'useQuery', 'useQueries', 'query'].includes(functionName) &&
        /\/(?:@tanstack\/(?:react-query|query-core)|features\/queries)\//.test(source)
      if (!isWagmiHook && !isQueryCall) return

      const [argument] = call.arguments
      if (!argument) return
      const getProperty = (type, key) => type && checker.getPropertyOfType(checker.getNonNullableType(type), key)
      const getPropertyType = (type, key) => {
        const symbol = getProperty(type, key)
        return symbol && checker.getTypeOfSymbolAtLocation(symbol, argument)
      }

      // Options are direct, under Wagmi's query, or in useQueries' queries array.
      const argumentType = checker.getTypeAtLocation(argument)
      const queryOptionsType = isWagmiHook ? getPropertyType(argumentType, 'query') : argumentType
      const queriesType = getPropertyType(queryOptionsType, 'queries')
      const optionsType =
        functionName === 'useQueries'
          ? queriesType && checker.getIndexTypeOfType(queriesType, ts.IndexKind.Number)
          : queryOptionsType
      const metaType = getPropertyType(optionsType, 'meta')

      // TypeScript may widen { persist: false } to boolean; also check the literal initializer.
      if (
        getPropertyType(metaType, 'persist')?.intrinsicName === 'false' ||
        getProperty(metaType, 'persist')?.valueDeclaration?.initializer?.kind === ts.SyntaxKind.FalseKeyword ||
        getPropertyType(optionsType, 'category')?.value === 'global.no-persist'
      )
        return

      // Wagmi's expected options type exposes select's raw input even when no select is supplied.
      const callbackType = isWagmiHook
        ? getPropertyType(getPropertyType(checker.getContextualType(argument), 'query'), 'select')
        : getPropertyType(optionsType, 'queryFn')
      const callbackTypes = callbackType?.isUnion() ? callbackType.types : [callbackType]
      // Ignore non-function union members such as undefined and skipToken.
      const signatures = callbackTypes.flatMap(type => type?.getCallSignatures() ?? [])
      const cachedDataTypes = signatures.map(signature => {
        if (isWagmiHook) {
          const [selectInput] = signature.parameters
          return selectInput && checker.getTypeOfSymbolAtLocation(selectInput, argument)
        }
        return checker.getAwaitedType(checker.getReturnTypeOfSignature(signature))
      })
      if (cachedDataTypes.some(type => hasBigint(checker, type, argument)))
        context.report({ node: isWagmiHook ? node : node.arguments[0], messageId: 'bigint' })
    },
  }),
}
