import { FieldPathValue, type FieldPath, type FieldValues, type UseFormReturn } from 'react-hook-form'

/** Shared defaults for action forms. */
export const formDefaultOptions = {
  mode: 'onChange',
  reValidateMode: 'onBlur',
  resetOptions: { keepErrors: false },
  delayError: 150,
  criteriaMode: 'all',
} as const

/**
 * Wrapper to call form.watch() and avoid lint errors about incompatible hooks.
 * The `eslint-disable-next-line react-hooks/incompatible-library` should be needed here, but eslint misses it.
 */
export const watchForm = <TFieldValues extends FieldValues>(form: UseFormReturn<TFieldValues>) => form.watch()

/**
 * Wrapper to call form.watch() and avoid lint errors about incompatible hooks.
 * The `eslint-disable-next-line react-hooks/incompatible-library` should be needed here, but eslint misses it.
 */
export const watchField = <TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>(
  form: UseFormReturn<TFieldValues>,
  name: TFieldName,
): FieldPathValue<TFieldValues, TFieldName> => form.watch(name)
