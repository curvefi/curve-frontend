import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { GearIcon } from '@evm-ui/shared/icons/GearIcon'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { ActionInfoSize } from '@evm-ui/shared/ui/ActionInfo/ActionInfo'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { formatNumber } from '@evm-ui/utils'
import IconButton from '@mui/material/IconButton'
import { capitalize } from '@mui/material/utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { SlippageType } from './slippage.utils'
import { SlippageSettingsModal } from './SlippageSettingsModal'
import type { SlippageSettingsFormData } from './useSlipageSettingsForm'

export const SlippageToleranceActionInfo = ({
  maxSlippage,
  onChanged,
  size,
  type,
  active,
}: {
  maxSlippage: Decimal | undefined
  onChanged?: (data: SlippageSettingsFormData) => void
  size?: ActionInfoSize
  type: SlippageType | SlippageType[] | undefined
  active?: SlippageType
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
        />
      )}
    </>
  )
}
