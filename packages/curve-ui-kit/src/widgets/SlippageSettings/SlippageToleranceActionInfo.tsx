import IconButton from '@mui/material/IconButton'
import { capitalize } from '@mui/material/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { ActionInfoSize } from '@ui-kit/shared/ui/ActionInfo/ActionInfo'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { formatNumber } from '@ui-kit/utils'
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
