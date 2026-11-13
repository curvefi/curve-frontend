import IconButton from '@mui/material/IconButton'
import { capitalize } from '@mui/material/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { Badge } from '@ui/components/Badge'
import { ActionInfoSize, ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { SlippageSettings, SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import { SlippageSettingsModal } from '@ui/features/forms/slippage/SlippageSettingsModal'
import { useSwitch } from '@ui/hooks/useSwitch'
import { GearIcon } from '@ui/icons/GearIcon'
import { t } from '@ui/lib/i18n'

export const SlippageToleranceActionInfo = ({
  maxSlippage,
  onChanged,
  size,
  type,
  active,
  userAddress,
  disabled = false,
}: {
  maxSlippage: Decimal | undefined
  onChanged?: (data: SlippageSettings) => void
  size?: ActionInfoSize
  type: SlippageType | SlippageType[] | undefined
  active?: SlippageType
  userAddress: Address | Nullish
  disabled?: boolean
}) => {
  const [isOpen, openModal, closeModal] = useSwitch()
  return (
    <>
      <ActionInfo
        label={t`Slippage`}
        value={formatNumber(maxSlippage, 'percent.rate')}
        valueLeft={active && <Badge size="extraSmall" label={capitalize(active)} />}
        valueRight={
          <IconButton
            onClick={openModal}
            disabled={disabled || !type?.length}
            size="extraExtraSmall"
            data-testid="slippage-settings-button"
          >
            <GearIcon sx={{ color: disabled ? 'text.disabled' : 'text.primary' }} />
          </IconButton>
        }
        size={size}
        testId="borrow-slippage"
      />

      {!disabled && isOpen != null && (
        <SlippageSettingsModal
          type={type}
          isOpen={isOpen}
          active={active}
          maxSlippage={maxSlippage}
          onChanged={slippage => {
            closeModal()
            onChanged?.(slippage)
          }}
          onClose={closeModal}
          userAddress={userAddress}
        />
      )}
    </>
  )
}
