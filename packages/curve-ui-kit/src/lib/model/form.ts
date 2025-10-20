export const formDefaultOptions = {
  mode: 'onChange',
  reValidateMode: 'onBlur',
  resetOptions: {
    keepErrors: false,
  },
  delayError: 150,
  criteriaMode: 'all',
} as const

// A lightweight resolver for react-hook-form using our validation Suite.
// It maps suite errors to RHF error objects and supports dot-path keys like 'root.serverError'.
import type { Suite } from '@ui-kit/lib/validation/lib'

type RHFResolver<TValues> = (
  values: TValues,
  context?: unknown,
  options?: { names?: string[] },
) => Promise<{ values: TValues; errors: Record<string, any> }> | { values: TValues; errors: Record<string, any> }

const setByPath = (obj: any, path: string, value: any) => {
  const parts = path.split('.')
  let curr = obj
  while (parts.length > 1) {
    const p = parts.shift()!
    curr[p] = curr[p] ?? {}
    curr = curr[p]
  }
  curr[parts[0]!] = value
}

export const suiteResolver =
  <TField extends string, TValues extends Record<string, any>>(suite: Suite<TField>): RHFResolver<TValues> =>
  async (values, _context, options) => {
    const result = suite(values as any, options?.names as unknown as TField[] | undefined)
    const errors: Record<string, any> = {}
    for (const [name, message] of Object.entries(result.getErrors())) {
      setByPath(errors, name, { type: 'validation', message })
    }
    return { values, errors }
  }
