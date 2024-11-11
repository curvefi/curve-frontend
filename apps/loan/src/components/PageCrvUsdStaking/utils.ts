export const isReady = (status: FetchStatus) => status === 'success'
export const isLoading = (status: FetchStatus) => status === 'loading'
export const isIdle = (status: FetchStatus) => status === ''
