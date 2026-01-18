import { useMemo } from 'react'
import type { FieldValues, SetValueConfig } from 'react-hook-form'
import type { FormState } from 'react-hook-form'
import { notFalsy, recordEntries } from '@curvefi/prices-api/objects.util'

/** Options to pass to react-hook-form's setValue to trigger validation, dirty and touch states. */
export const setValueOptions: SetValueConfig = { shouldValidate: true, shouldDirty: true, shouldTouch: true }

export const useFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  useMemo(
    () =>
      notFalsy(
        ...(recordEntries(formState.errors) as [keyof TFieldValues | 'root', Error | undefined][])
          .filter(([field, error]) => field in formState.dirtyFields && error?.message)
          .map(([field, error]) => [field, error!.message!] as const),
      ),
    [formState],
  )
