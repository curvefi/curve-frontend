import { type Mutation, MutationCache } from '@tanstack/react-query'
import { addBreadcrumb, captureError } from '@ui-kit/features/sentry'
import { logError, logMutation, logSuccess } from '@ui-kit/lib/logging'

const getMutationKey = (mutation: Mutation<unknown, unknown, unknown, unknown>, variables: unknown) => {
  const queryKeyFn = mutation.options.meta?.queryKeyFn
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Existing violation before enabling this rule.
  return typeof queryKeyFn === 'function'
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Existing violation before enabling this rule.
      queryKeyFn(variables)
    : (mutation.options.mutationKey ?? String(mutation.mutationId))
}

export const mutationCache = new MutationCache({
  onError: (error, variables, _context, mutation) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
    const mutationKey = getMutationKey(mutation, variables)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
    logError(mutationKey, error, error.message)
    captureError(error, { mutationKey, variables, mutation })
  },
  onSuccess: (data, variables, _context, mutation) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
    logSuccess(getMutationKey(mutation, variables), { data })
  },
  onMutate: (variables, mutation) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
    const mutationKey = getMutationKey(mutation, variables)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
    logMutation(mutationKey)
    addBreadcrumb('onMutate', 'mutation', { mutationKey, variables, mutation })
  },
})
