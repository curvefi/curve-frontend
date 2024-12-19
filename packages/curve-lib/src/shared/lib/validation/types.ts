export type FieldName<T> = Extract<keyof T, string>

export type FieldsOf<T> = {
  [K in FieldName<T>]?: T[K] | null | undefined
}
