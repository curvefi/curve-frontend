import { useForm } from 'react-hook-form'
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

export const useErrorReportForm = ({ error, ...context }: ErrorContext, onClose: () => void) => {
  const form = useForm<ErrorReportFormValues>({
    ...formDefaultOptions,
    defaultValues: { address: '', contactMethod: 'email', contact: '', description: '' },
  })
  return {
    form,
    values: watchForm(form),
    onSubmit: form.handleSubmit(async (formData) => {
      const report = {
        formData,
        url: window.location.href,
        context: {
          ...context,
          error:
            error instanceof Error
              ? { ...error, name: error.name, message: error.message, stack: error.stack, cause: error.cause }
              : error,
        },
      }
      console.info(`Submitting error report:`, report)
      try {
        await fetchJson('/api/error-report', { body: JSON.stringify(report) })
        onClose()
      } catch (e) {
        console.warn(e)
        form.setError('root', { type: 'server', message: e.message })
      }
    }),
  }
}
