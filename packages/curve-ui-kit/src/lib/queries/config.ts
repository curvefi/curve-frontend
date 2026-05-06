const createQueryStatus = ({ value }: { value: boolean }) => ({ isLoading: value, isPending: value, isFetching: value })

const QUERY_SUCCESS_BASE = { isError: false, data: undefined, error: null }

export const FETCHING_QUERY_RESULT = {
  ...createQueryStatus({ value: true }),
  ...QUERY_SUCCESS_BASE,
} as const

export const RESOLVED_QUERY_RESULT = {
  ...createQueryStatus({ value: false }),
  ...QUERY_SUCCESS_BASE,
} as const
