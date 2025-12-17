import { type Mutation, MutationCache, QueryCache } from '@tanstack/react-query'
import { logError, logMutation, logSuccess } from '@ui-kit/lib/logging'

// disable logging for queries that are too verbose
const disableCacheQueryKeys = new Set<unknown>(['readContracts']) // add more query keys here to disable logging

export const queryCache = new QueryCache({
  onError: (error: Error, query) => logError(query.queryKey, error, error.message),
  onSuccess: (data, { queryKey }) => {
    if (!disableCacheQueryKeys.has(queryKey[0])) {
      logSuccess(queryKey, ...[data ? [data] : []])
    }
  },
})

const getMutationKey = (mutation: Mutation<unknown, unknown, unknown, unknown>, variables: unknown) => {
  const queryKeyFn = mutation.options.meta?.queryKeyFn
  return typeof queryKeyFn === 'function'
    ? queryKeyFn(variables)
    : (mutation.options.mutationKey ?? String(mutation.mutationId))
}

export const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    const variablesMutationKey = getMutationKey(mutation, variables)
    logError(variablesMutationKey, error, error.message)
  },
  onSuccess: (data, variables, context, mutation) => {
    const variablesMutationKey = getMutationKey(mutation, variables)
    logSuccess(variablesMutationKey, { data })
  },
  onMutate: (variables, mutation) => {
    const variablesMutationKey = getMutationKey(mutation, variables)
    logMutation(variablesMutationKey)
  },
})
