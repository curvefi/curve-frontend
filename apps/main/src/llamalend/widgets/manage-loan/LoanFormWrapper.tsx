import type { FormEventHandler, ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { FieldValues, FormProviderProps } from 'react-hook-form'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

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
      <Stack gap={Spacing.sm}>
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <AppFormContentWrapper>
            <Stack gap={Spacing.md}>{children}</Stack>
          </AppFormContentWrapper>
        </Stack>

        {infoAccordion}
      </Stack>
    </form>
  </FormProvider>
)
