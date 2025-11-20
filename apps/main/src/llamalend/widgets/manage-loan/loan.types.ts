export type Query<T> = {
  data: T | undefined
  isLoading: boolean
  error: Error | null | undefined
}
