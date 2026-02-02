import { useForm } from 'react-hook-form'
import { captureError, captureString } from '@ui-kit/features/sentry'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model/form'

export type ContactMethod = 'email' | 'telegram' | 'discord'

export type ErrorContext = {
  error: Error | string | null | undefined
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
      const body = {
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
      console.info(`Submitting error report:`, body)
      try {
        if (error instanceof Error) {
          captureError(error, { body })
        } else {
          captureString(error ?? 'Error Report', { body })
        }
        onClose()
      } catch (e) {
        console.warn(e)
        form.setError('root', { type: 'server', message: e.message })
      }
    }),
  }
}
