import AlertFormError from '@/components/AlertFormError'
import { ErrorContainer } from '@/shared/ui/styled-containers'
import { ErrorMessage } from '@hookform/error-message'
import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import type { FormError } from '@/shared/ui/forms/error-types'

const getErrorMessage = (error: FormError): string => {
  if (!error) return 'Unknown error'
  if ('message' in error) {
    return error.message
  } else if ('shortMessage' in error) {
    return `${error.code}: ${error.shortMessage}\n${error.info.key}: ${JSON.stringify(error.info.args)}`
  }
  return String(error)
}

export const FormErrorsDisplay = <T extends Record<string, any>>({ errorKeys }: { errorKeys?: Array<keyof T> }) => {
  const {
    formState: { errors },
    clearErrors,
  } = useFormContext<T>()

  const filteredErrors = useMemo<[string, any][]>(() => {
    const shouldDisplayError = errorKeys ? (key: string) => errorKeys.includes(key) : () => true

    const errorsArray = [
      ...Object.entries(errors).filter(([key]) => key !== 'root' && shouldDisplayError(key)),
      ...(errors.root
        ? Object.entries(errors.root)
            .filter(([key]) => shouldDisplayError(`root.${key}`))
            .map(([key, value]): [string, any] => [`root.${key}`, value])
        : []),
    ]
    return errorsArray
  }, [errorKeys, errors])

  const renderErrorMessage = useCallback(
    (key: string, error: any) => (
      <ErrorMessage
        key={key}
        name={key}
        render={() => {
          const errorMessage = getErrorMessage(error as FormError)
          return <AlertFormError errorKey={errorMessage} handleBtnClose={() => clearErrors(key as any)} />
        }}
      />
    ),
    [clearErrors]
  )

  if (filteredErrors.length === 0) return null

  return <ErrorContainer>{filteredErrors.map(([key, error]) => renderErrorMessage(key, error))}</ErrorContainer>
}
