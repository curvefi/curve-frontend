import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { FormProvider } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { SLIPPAGE_TYPES } from './slippage.utils'
import { SlippageFormField } from './SlippageFormField'
import { type SlippageSettingsFormData, useSlippageSettingsForm } from './useSlipageSettingsForm'

const { Spacing } = SizesAndSpaces

export type SlippageSettingsProps = {
  /** Whether the modal is currently open */
  isOpen: boolean
}

export type SlippageSettingsCallbacks = {
  onClose: () => void
  onSave: (data: SlippageSettingsFormData) => void
}

type Props = SlippageSettingsProps & SlippageSettingsCallbacks

/**
 * Modal component for configuring slippage settings
 *
 * Slippage rules:
 * - Min slippage: 0.01% (values below this are considered too low)
 * - Max recommended slippage: 5% (values above this trigger a warning)
 */
export const SlippageSettingsModal = ({ isOpen, onSave, onClose }: Props) => {
  const { onSubmit, form, reset } = useSlippageSettingsForm({ onSave })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <ModalDialog
          open={isOpen}
          onClose={onClose}
          onTransitionExited={reset}
          title={t`Slippage Settings`}
          footer={
            <Stack gap={Spacing.sm} flexGrow={1}>
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
          compact
        >
          <Stack gap={Spacing.sm}>
            <SlippageFormField
              type="stable"
              helper={t`Used when the route only goes through stableswaps`}
              title={t`Stableswap slippage`}
              form={form}
            />
            <SlippageFormField
              type="crypto"
              title={t`Cryptoswap slippage`}
              helper={t`Used when the route goes through at least one cryptoswap`}
              form={form}
            />
            <SlippageFormField
              type="leverage"
              title={t`Leverage slippage`}
              helper={t`Used when leveraging on llamalend`}
              form={form}
            />
          </Stack>
        </ModalDialog>
      </form>
    </FormProvider>
  )
}
