import { ErrorContainer } from '@/styled-containers'
import { ErrorMessage } from '@hookform/error-message'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import type { FormError } from './error-types'

const getErrorMessage = (error: FormError): string => {
  if (!error) return 'Unknown error'
  if ('message' in error) {
    return error.message
  } else if ('shortMessage' in error) {
    return `${error.code}: ${error.shortMessage}\n${error.info.key}: ${JSON.stringify(error.info.args)}`
  }
  return String(error)
}

type FormErrorsDisplayProps<T extends Record<string, any>> = {
  errorKeys?: Array<keyof T>,
  component: FunctionComponent<{errorKey: string, handleBtnClose: () => void}>
}

export const FormErrorsDisplay = <T extends Record<string, any>>({ errorKeys, component: Component }: FormErrorsDisplayProps<T>) => {
  const {
    formState: { errors },
    clearErrors,
  } = useFormContext<T>()

  const filteredErrors = useMemo<[string, any][]>(() => {
    const shouldDisplayError = errorKeys ? (key: string) => errorKeys.includes(key) : () => true
    return [
      ...Object.entries(errors).filter(([key]) => key !== 'root' && shouldDisplayError(key)),
      ...(errors.root
        ? Object.entries(errors.root)
            .filter(([key]) => shouldDisplayError(`root.${key}`))
            .map(([key, value]): [string, any] => [`root.${key}`, value])
        : []),
    ]
  }, [errorKeys, errors])

  const renderErrorMessage = useCallback(
    (key: string, error: any) => (
      <ErrorMessage
        key={key}
        name={key}
        render={() => {
          const errorMessage = getErrorMessage(error as FormError)
          return <Component errorKey={errorMessage} handleBtnClose={() => clearErrors(key as any)} />
        }}
      />
    ),
    [Component, clearErrors]
  )

  if (filteredErrors.length === 0) return null

  return <ErrorContainer>{filteredErrors.map(([key, error]) => renderErrorMessage(key, error))}</ErrorContainer>
}
