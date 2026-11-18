import type { ReactNode } from 'react'
import type { FormSubmitHandler } from '../form.types'
import { FormContent } from './FormContent'

/** Shared layout for forms whose values and validation are passed explicitly to controls. */
export const FormContainer = ({
  onSubmit,
  children,
  footer,
  ...props
}: {
  onSubmit: FormSubmitHandler
  children: ReactNode
  footer?: ReactNode
  'data-testid'?: string
}) => (
  <form {...props} onSubmit={event => void onSubmit(event)} style={{ overflowWrap: 'break-word' }}>
    <FormContent footer={footer}>{children}</FormContent>
  </form>
)
