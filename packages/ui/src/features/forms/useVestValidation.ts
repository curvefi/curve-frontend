import { useMemo } from 'react'
import type { Suite } from 'vest'
import { isEmpty, mapRecord } from '@primitives/objects.utils'
import type { FieldName, FieldsOf } from '@ui/lib/validation/types'

/** Synchronous validation with retained field errors and an independent full validity check. */
export function useVestValidation<TValidatedForm extends object>(
  validation: Suite<FieldName<TValidatedForm>, string>,
  resetVersion: number,
  data: FieldsOf<TValidatedForm>,
  fieldsToValidate: (keyof TValidatedForm)[],
) {
  const session = useMemo(() => {
    validation.reset()
    return { validation, resetVersion }
  }, [validation, resetVersion])

  // run vest validation, which only creates errors for the fields given.
  const errors = mapRecord(
    session.validation.run(data, fieldsToValidate).getErrors(),
    (_, [message]) => new Error(message),
  )

  // To check full form validity, run runStatic, which changes state. We use a snapshot to restore it after validating.
  const snapshot = session.validation.dump()
  try {
    return { errors, isValid: isEmpty(session.validation.runStatic(data).getErrors()) }
  } finally {
    session.validation.resume(snapshot)
  }
}
