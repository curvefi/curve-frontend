export type ValidatedData<T extends object> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

export type FieldName<T> = Extract<keyof T, string>

export type NonValidatedFields<T> = {
  [K in FieldName<T>]: T[K] | null | undefined
}
