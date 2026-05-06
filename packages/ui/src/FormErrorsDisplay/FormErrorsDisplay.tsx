import { FunctionComponent, useMemo } from 'react'
import { useFormContext } from '@ui-kit/features/forms'
import { ErrorContainer } from '../styled-containers'
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

type FormErrorsDisplayProps<T extends Record<string, unknown>> = {
  errorKeys?: (keyof T)[]
  component: FunctionComponent<{ errorKey: string; handleBtnClose: () => void }>
}

export const FormErrorsDisplay = <T extends Record<string, unknown>>({
  errorKeys,
  component: Component,
}: FormErrorsDisplayProps<T>) => {
  const {
    formState: { errors },
    clearErrors,
  } = useFormContext<T>()

  const filteredErrors = useMemo<[string, unknown][]>(() => {
    const shouldDisplayError = errorKeys ? (key: string) => errorKeys.includes(key) : () => true
    return [
      ...Object.entries(errors).filter(([key]) => key !== 'root' && shouldDisplayError(key)),
      ...(errors.root
        ? Object.entries(errors.root)
            .filter(([key]) => shouldDisplayError(`root.${key}`))
            .map(([key, value]): [string, unknown] => [`root.${key}`, value])
        : []),
    ]
  }, [errorKeys, errors])

  if (filteredErrors.length === 0) return null

  return (
    <ErrorContainer>
      {filteredErrors.map(([key, error]) => (
        <Component
          key={key}
          errorKey={getErrorMessage(error as FormError)}
          handleBtnClose={() => clearErrors(key as Parameters<typeof clearErrors>[0])}
        />
      ))}
    </ErrorContainer>
  )
}
