import { type Mutation, MutationCache, QueryCache } from '@tanstack/react-query'
import { addBreadcrumb, captureError } from '@ui-kit/features/sentry'
import { logError, logMutation, logSuccess } from '@ui-kit/lib/logging'
import { QUERY_KEY_IDENTIFIER as USD_RATE_KEY_IDENTIFER } from '../model/entities/token-usd-rate'

// disable logging for queries that are too verbose
const disableCacheQueryKeys = new Set<unknown>(['readContracts', USD_RATE_KEY_IDENTIFER])

export const queryCache = new QueryCache({
  onError: (error: Error, query) => logError(query.queryKey, error, error.message),
  onSuccess: (data, { queryKey }) => {
    if (!queryKey.some((key) => disableCacheQueryKeys.has(key))) {
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
  onError: (error, variables, _context, mutation) => {
    const mutationKey = getMutationKey(mutation, variables)
    logError(mutationKey, error, error.message)
    captureError(error, { mutationKey, variables, mutation })
  },
  onSuccess: (data, variables, _context, mutation) => {
    logSuccess(getMutationKey(mutation, variables), { data })
  },
  onMutate: (variables, mutation) => {
    const mutationKey = getMutationKey(mutation, variables)
    logMutation(mutationKey)
    addBreadcrumb('onMutate', 'mutation', { mutationKey, variables, mutation })
  },
})
