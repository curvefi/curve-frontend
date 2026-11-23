import { type ReactNode } from 'react'
import type { FormSubmitHandler } from '@ui/features/forms'
import { FormContent } from './FormContent'

/**
 * A form element with a content wrapper and development form state display.
 * Supports a footer below the form (outside the background area).
 */
export const Form = ({
  onSubmit,
  children,
  footer,
}: {
  onSubmit: FormSubmitHandler
  children: ReactNode
  footer: ReactNode
}) => (
  <form onSubmit={event => void onSubmit(event)} style={{ overflowWrap: 'break-word' }}>
    <FormContent footer={footer}>{children}</FormContent>
  </form>
)
