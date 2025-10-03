import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { Decimal, formatPercent as formatPercent } from '@ui-kit/utils'
import { SlippageSettings } from '@ui-kit/widgets/slippage-settings/SlippageSettings'

export const SlippageToleranceActionInfo = ({
  maxSlippage,
  onSave,
}: {
  maxSlippage: Decimal
  onSave: (newSlippage: Decimal) => void
}) => (
  <ActionInfo
    label={t`Slippage tolerance`}
    value={formatPercent(maxSlippage)}
    valueRight={
      <SlippageSettings
        buttonSize="extraSmall"
        buttonIcon={<GearIcon sx={{ color: 'text.primary' }} />}
        maxSlippage={`${maxSlippage}`}
        onSave={onSave}
      />
    }
    testId="borrow-slippage"
  />
)
