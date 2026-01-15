import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { fetchJson } from '@curvefi/prices-api/fetch'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model/form'

export type ContactMethod = 'email' | 'telegram' | 'discord'

export type ErrorContext = {
  error: unknown
  title: string
  subtitle: string
}

export type ErrorReportFormValues = {
  address: string
  contactMethod: ContactMethod
  contact: string
  description: string
  context?: ErrorContext
}

export const useErrorReportForm = ({ error, ...context }: ErrorContext) => {
  const { address: userAddress } = useConnection()
  const form = useForm<ErrorReportFormValues>({
    ...formDefaultOptions,
    defaultValues: { address: userAddress ?? '', contactMethod: 'email', contact: '', description: '' },
  })
  return {
    form,
    values: watchForm(form),
    onSubmit: form.handleSubmit(
      async (formData) =>
        await fetchJson('/api/error-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData,
            url: window.location.href,
            context: {
              ...context,
              error:
                error instanceof Error
                  ? { ...error, name: error.name, message: error.message, stack: error.stack, cause: error.cause }
                  : error,
            },
          }),
        }),
    ),
  }
}
