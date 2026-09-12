import IconButton from '@mui/material/IconButton'
import { capitalize } from '@mui/material/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { Badge } from '@ui/components/Badge'
import { ActionInfoSize, ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import { SlippageSettingsModal } from '@ui/features/forms/slippage/SlippageSettingsModal'
import type { SlippageSettingsFormData } from '@ui/features/forms/slippage/useSlipageSettingsForm'
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
}: {
  maxSlippage: Decimal | undefined
  onChanged?: (data: SlippageSettingsFormData) => void
  size?: ActionInfoSize
  type: SlippageType | SlippageType[] | undefined
  active?: SlippageType
  userAddress: Address | undefined
}) => {
  const [isOpen, openModal, closeModal] = useSwitch()
  return (
    <>
      <ActionInfo
        label={t`Slippage`}
        value={formatNumber(maxSlippage, 'percent.rate')}
        valueLeft={active && <Badge size="extraSmall" label={capitalize(active)} />}
        valueRight={
          <IconButton onClick={openModal} size="extraExtraSmall" data-testid="slippage-settings-button">
            <GearIcon sx={{ color: 'text.primary' }} />
          </IconButton>
        }
        size={size}
        testId="borrow-slippage"
      />

      {isOpen != null && (
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
