export const FETCHING = {
  isError: false,
  isLoading: true,
  isPending: true,
  isFetching: true,
  data: undefined,
  error: null,
} as const
export const READY = { isError: false, isLoading: false, isPending: false, isFetching: false, error: null } as const
