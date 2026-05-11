import { FieldPathValue, type FieldPath, type FieldValues, type UseFormReturn } from '@ui-kit/features/forms'

/** Shared defaults for action forms. */
export const formDefaultOptions = {} as const // todo: get rid of this

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
