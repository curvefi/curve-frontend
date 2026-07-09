import { ReactNode } from 'react'
import { useForm } from '@ui-kit/features/forms'
import { captureError, captureString } from '@ui-kit/features/sentry'

export type ContactMethod = 'email' | 'telegram' | 'discord'

export type ErrorContext = {
  error: Error | string | null | undefined
  title: ReactNode
  subtitle: ReactNode | null | undefined
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
    defaultValues: { address: '', contactMethod: 'email', contact: '', description: '' },
  })
  return {
    form,
    values: form.watchValues(),
    // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
    onSubmit: form.handleSubmit(async formData => {
      const body = {
        formData,
        url: window.location.href,
        context: {
          ...context,
          // stringify error because sentry will simply call .toString() on non-Error objects
          error:
            typeof error == 'string'
              ? error
              : JSON.stringify(
                  error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
                ),
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        form.setError('root', { type: 'server', message: e.message })
      }
    }),
  }
}
