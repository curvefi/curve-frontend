import { useMemo } from 'react'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import { FormValidateFn, RejectPromiseValidator } from '@tanstack/react-form'
import type { FieldPath, FieldValues } from '@ui-kit/features/forms/form.types'
import type { ValidationSuite } from '@ui-kit/lib'

const createValidator =
  <T extends FieldValues>(validation: ValidationSuite): RejectPromiseValidator<FormValidateFn<T>> =>
  ({ value }: { value: T }) => {
    const { root, ...errors } = validation(value).getErrors()
    return {
      fields: fromEntries(recordEntries(errors).map(([field, errors]) => [field as FieldPath<T>, errors.join('\n')])),
      form: root?.join('\n'),
    }
  }

export const useFormValidation = <T extends FieldValues>(validation: ValidationSuite | undefined) =>
  useMemo(() => {
    const validator = validation && createValidator<T>(validation)
    return validation && { validators: { onChange: validator, onMount: validator } }
  }, [validation])
