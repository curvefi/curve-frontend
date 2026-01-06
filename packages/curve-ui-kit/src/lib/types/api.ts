/**
 * Extracts parameter types from a method of a given type.
 * If the property is not a function, it returns never.
 */
export type ExtractMethodParameters<T, M extends keyof T> = T[M] extends (...args: never[]) => unknown
  ? Parameters<T[M]>
  : never

/**
 * Extracts the return type of a specific method of a given type.
 */
export type ExtractMethodResult<T, M extends keyof T> = T[M] extends (...args: never[]) => unknown
  ? ReturnType<T[M]>
  : never

/**
 * Extracts all possible return types from an object of query key functions.
 */
export type ExtractQueryKeys<T extends Record<keyof T, (...args: never[]) => unknown>> = ReturnType<T[keyof T]>

/**
 * Extracts the return type of a specific query key function.
 */
export type ExtractQueryKeyType<
  T extends Record<keyof T, (...args: never[]) => unknown>,
  K extends keyof T,
> = ReturnType<T[K]>
