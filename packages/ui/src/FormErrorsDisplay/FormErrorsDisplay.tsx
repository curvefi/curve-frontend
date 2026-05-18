import { FunctionComponent, useMemo } from 'react'
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
  const {
    formState: { errors },
    clearErrors,
    clearRootError,
  } = useFormContext<T>()

  const filteredErrors = useMemo<DisplayErrorEntry<T>[]>(() => {
    const shouldDisplayError = errorKeys ? (key: string) => errorKeys.includes(key as ErrorKey<T>) : () => true
    return [
      ...Object.entries(errors)
        .filter(([key, error]) => key !== 'root' && !!error && shouldDisplayError(key))
        .map(([key, error]) => [key as FieldPath<T>, error] as DisplayErrorEntry<T>),
      ...(errors.root && shouldDisplayError('root') ? ([['root', errors.root]] as DisplayErrorEntry<T>[]) : []),
    ]
  }, [errorKeys, errors])

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
