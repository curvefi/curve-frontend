import { FunctionComponent, useMemo } from 'react'
import { notFalsyArray, recordEntries } from '@primitives/objects.utils'
import type { ErrorKey, FieldPath } from '@ui-kit/features/forms'
import { useFormContext } from '@ui-kit/features/forms'
import { ErrorContainer } from '../styled-containers'
import type { FormError } from './error-types'

type DisplayErrorEntry<T extends Record<string, unknown>> = [ErrorKey<T>, FormError]

const getErrorMessage = (error: FormError): string => {
  if (!error) return 'Unknown error'
  if ('message' in error) {
    return error.message
  } else if ('shortMessage' in error) {
    return `${error.code}: ${error.shortMessage}\n${error.info.key}: ${JSON.stringify(error.info.args)}`
  }
  return String(error)
}

type FormErrorsDisplayProps<T extends Record<string, unknown>> = {
  errorKeys?: ErrorKey<T>[]
  component: FunctionComponent<{ errorKey: string; handleBtnClose: () => void }>
}

export const FormErrorsDisplay = <T extends Record<string, unknown>>({
  errorKeys,
  component: Component,
}: FormErrorsDisplayProps<T>) => {
  const { formState, clearErrors, clearRootError } = useFormContext<T>()
  const { errors } = formState

  const filteredErrors = useMemo(
    () =>
      notFalsyArray(
        recordEntries(errors).filter(([key, error]) => error && (errorKeys?.includes(key) ?? true)),
      ) as DisplayErrorEntry<T>[],
    [errorKeys, errors],
  )

  return (
    filteredErrors.length > 0 && (
      <ErrorContainer>
        {filteredErrors.map(([key, error]) => (
          <Component
            key={key}
            errorKey={getErrorMessage(error)}
            handleBtnClose={() => (key === 'root' ? clearRootError() : clearErrors(key as FieldPath<T>))}
          />
        ))}
      </ErrorContainer>
    )
  )
}
