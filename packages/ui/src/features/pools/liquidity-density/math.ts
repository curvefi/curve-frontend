import { maybe } from '@primitives/objects.utils'

export const product = (values: readonly number[]) => values.reduce((total, value) => total * value, 1)

/** Multiply and divide at each step, preserving the solvers' floating-point operation order. */
export const productOfRatios = (initial: number, numerator: number, denominators: readonly number[]) =>
  denominators.reduce((value, denominator) => (value * numerator) / denominator, initial)

/** Apply a step before checking stop; keep the last value or propagate an undefined failure. */
export const iterate = <T>(
  initial: T,
  steps: readonly number[],
  next: (value: Readonly<NonNullable<T>>) => T,
  stop: (value: Readonly<NonNullable<T>>) => boolean,
): T =>
  steps.reduce<T>((value, _, index) => (value == null || (index > 0 && stop(value)) ? value : next(value)), initial)

/** Return a converged value, or undefined when a step fails or the iteration limit is reached. */
export const converge = (
  initial: number,
  steps: readonly number[],
  next: (value: number) => number | undefined,
  converged: (value: number, previous: number) => boolean,
): number | undefined => {
  const result = iterate<{ value: number; done: boolean } | undefined>(
    { value: initial, done: false },
    steps,
    ({ value: previous }) => maybe(next(previous), value => ({ value, done: converged(value, previous) })),
    ({ done }) => done,
  )
  return result?.done ? result.value : undefined
}
