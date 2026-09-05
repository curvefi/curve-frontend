import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { ActionInfoSize } from '@evm-ui/shared/ui/ActionInfo/ActionInfo'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { formatNumber } from '@evm-ui/utils'
import type { SlippageType } from '@evm-ui/widgets/SlippageSettings/slippage.utils'
import { SlippageSettingsModal } from '@evm-ui/widgets/SlippageSettings/SlippageSettingsModal'
import type { SlippageSettingsFormData } from '@evm-ui/widgets/SlippageSettings/useSlipageSettingsForm'
import IconButton from '@mui/material/IconButton'
import { capitalize } from '@mui/material/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
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
