export type ValidatedData<T extends object> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

export type ValidatedFields<T> = {
  [K in keyof T]: NonNullable<T[K]>
}
