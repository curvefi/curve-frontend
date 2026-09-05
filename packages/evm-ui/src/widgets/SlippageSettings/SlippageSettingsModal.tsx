import { FormProvider } from '@evm-ui/features/forms'
import { ModalDialog } from '@evm-ui/shared/ui/ModalDialog'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
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
  maxSlippage,
  userAddress,
}: {
  isOpen: boolean
  onClose: () => void
  onChanged: (data: SlippageSettingsFormData) => void
  type: SlippageType | SlippageType[] | undefined
  active?: SlippageType
  maxSlippage?: Decimal
  userAddress?: Address
}) => {
  const types = toArray(type)
  const currentType = active ?? (typeof type === 'string' ? type : undefined)
  const currentSlippage =
    currentType && maxSlippage !== undefined ? { type: currentType, value: maxSlippage } : undefined
  const { onSubmit, form, reset } = useSlippageSettingsForm({ onChanged, current: currentSlippage })
  return (
    <FormProvider {...form} hideFormState>
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
              type={form.formState.isDirty ? 'submit' : 'button'}
              data-testid="slippage-save-button"
              {...(!form.formState.isDirty && { onClick: onClose })}
            >{t`Save`}</Button>
            <FormAlerts
              formErrors={form.formState.visibleErrors}
              handledErrors={SLIPPAGE_TYPES}
              userAddress={userAddress}
            />
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
