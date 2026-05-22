import { useMemo } from 'react'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import { FormValidateFn, RejectPromiseValidator } from '@tanstack/react-form'
import type { FieldPath, FieldValues } from '@ui-kit/features/forms/form.types'
import type { ValidationSuite } from '@ui-kit/lib'

const createValidator =
  <T extends FieldValues>(validation: ValidationSuite): RejectPromiseValidator<FormValidateFn<T>> =>
  ({ value }: { value: T }) => ({
    fields: fromEntries(
      recordEntries(validation(value).getErrors()).map(([field, errors]) => [field as FieldPath<T>, errors.join('\n')]),
    ),
  })

export const useFormValidation = <T extends FieldValues>(validation: ValidationSuite | undefined) =>
  useMemo(() => {
    const validator = validation && createValidator<T>(validation)
    return validation && { validators: { onChange: validator, onMount: validator } }
  }, [validation])
