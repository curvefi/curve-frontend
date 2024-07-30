export type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? (T[K] extends Function ? K : `${K}.${NestedKeys<T[K]>}`) : never
    }[keyof T]
  : never

export type NestedProperty<T, K extends string> = K extends `${infer P}.${infer R}`
  ? P extends keyof T
    ? NestedProperty<T[P], R>
    : never
  : K extends keyof T
  ? T[K]
  : never
