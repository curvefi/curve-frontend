import type { FormEventHandler, ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { FieldValues, FormProviderProps } from 'react-hook-form'
import { FormContent } from '@ui-kit/shared/ui/FormTabs/FormTabs'

/**
 * A form wrapper for loan forms that wraps the form with FormProvider, form and styles.
 * Supports a child info accordion below the form.
 */
export const LoanFormWrapper = <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>({
  onSubmit,
  children,
  infoAccordion,
  ...form
}: {
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  infoAccordion: ReactNode
} & FormProviderProps<TFieldValues, TContext, TTransformedValues>) => (
  <FormProvider {...form}>
    <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
      <FormContent footer={infoAccordion}>{children}</FormContent>
    </form>
  </FormProvider>
)
