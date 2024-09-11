import { logError, logMutation, logSuccess } from '@/utils'
import { MutationCache, QueryCache, type Mutation } from '@tanstack/react-query'

export const queryCache = new QueryCache({
  onError: (error: Error, query) => {
    logError(query.queryKey, error, error.message)
  },
  onSuccess: (data, query) => {
    logSuccess(query.queryKey, data ? { data } : '')
  },
})

const getMutationKey = (mutation: Mutation<unknown, unknown, unknown, unknown>, variables: unknown) => {
  const queryKeyFn = mutation.options.meta?.queryKeyFn
  const variablesMutationKey =
    typeof queryKeyFn === 'function'
      ? queryKeyFn(variables)
      : mutation.options.mutationKey ?? String(mutation.mutationId)
  return variablesMutationKey
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
