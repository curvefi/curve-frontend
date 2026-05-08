const createQueryStatus = ({ value }: { value: boolean }) => ({ isLoading: value, isPending: value, isFetching: value })

const QUERY_SUCCESS_BASE = { isError: false, data: undefined, error: null }

// Simulates a successful query that is currently fetching.
export const FETCHING_QUERY_RESULT = {
  ...createQueryStatus({ value: true }),
  ...QUERY_SUCCESS_BASE,
} as const

// Simulates a successful query that has resolved and is idle.
export const RESOLVED_QUERY_RESULT = {
  ...createQueryStatus({ value: false }),
  ...QUERY_SUCCESS_BASE,
} as const
