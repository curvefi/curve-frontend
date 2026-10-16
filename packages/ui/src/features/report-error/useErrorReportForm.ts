import { ReactNode } from 'react'
import type { Nullish } from '@primitives/objects.utils'
import { normalize } from '@sentry/core'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import { useForm } from '@ui/features/forms'
import { captureUserReport } from '@ui/features/sentry'

export type ContactMethod = 'email' | 'telegram' | 'discord'

export type ErrorContext = { error: unknown; title: ReactNode; subtitle: ReactNode | Nullish }

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
    values: form.values,
    onSubmit: form.handleSubmit(async formData => {
      try {
        await captureUserReport(error, {
          formData,
          url: window.location.href,
          context: {
            ...context,
            // stringify error because sentry will simply call .toString() on non-Error objects
            error:
              typeof error == 'string'
                ? error
                : JSON.stringify(
                    normalize(
                      error instanceof Error
                        ? { ...error, name: error.name, message: error.message, stack: error.stack, cause: error.cause }
                        : error,
                    ),
                  ),
          },
        })
        onClose()
      } catch (e) {
        console.warn(e)
        form.setError('root', { type: 'server', message: getErrorMessage(e, 'Unable to submit error report') })
      }
    }),
  }
}
