import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { toArray } from '@primitives/array.utils'
import { FormProvider } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { SLIPPAGE_TYPES, type SlippageType } from './slippage.utils'
import { SlippageFormField } from './SlippageFormField'
import { type SlippageSettingsFormData, useSlippageSettingsForm } from './useSlipageSettingsForm'

const { Spacing } = SizesAndSpaces

export const SlippageSettingsModal = ({
  isOpen,
  onChanged,
  onClose,
  type,
  active,
}: {
  isOpen: boolean
  onClose: () => void
  onChanged: (data: SlippageSettingsFormData) => void
  type: SlippageType | SlippageType[] | undefined
  active?: SlippageType
}) => {
  const { onSubmit, form, reset } = useSlippageSettingsForm({ onChanged })
  const types = toArray(type)
  return (
    <FormProvider {...form}>
      <ModalDialog
        open={isOpen}
        onClose={onClose}
        onTransitionExited={reset}
        title={t`Slippage Settings`}
        footer={
          <Stack sx={{ gap: Spacing.sm, flexGrow: 1 }}>
            <Button
              disabled={!form.formState.isValid}
              fullWidth
              type="submit"
              data-testid="slippage-save-button"
              {...(!form.formState.isDirty && { onClick: onClose })}
            >{t`Save`}</Button>
            <FormAlerts formErrors={form.formState.visibleErrors} handledErrors={SLIPPAGE_TYPES} />
          </Stack>
        }
        formProps={{ onSubmit }}
        compact
      >
        <Stack sx={{ gap: Spacing.md }}>
          {types.map(type => (
            <SlippageFormField key={type} type={type} isActive={active === type} form={form} />
          ))}
        </Stack>
      </ModalDialog>
    </FormProvider>
  )
}
