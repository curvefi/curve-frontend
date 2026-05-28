import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { ActionInfoSize } from '@ui-kit/shared/ui/ActionInfo/ActionInfo'
import { formatPercent as formatPercent } from '@ui-kit/utils'
import type { SlippageType } from './slippage.utils'
import { SlippageSettings } from './SlippageSettings'
import type { SlippageSettingsFormData } from './useSlipageSettingsForm'

export const SlippageToleranceActionInfo = ({
  maxSlippage,
  onChanged,
  size,
  stateKey,
}: {
  maxSlippage: Decimal
  onChanged?: (data: SlippageSettingsFormData) => void
  size?: ActionInfoSize
  stateKey: SlippageType | string
}) => (
  <ActionInfo
    label={t`Slippage`}
    value={formatPercent(maxSlippage)}
    valueRight={<SlippageSettings onChanged={onChanged} />}
    size={size}
    testId="borrow-slippage"
  />
)
