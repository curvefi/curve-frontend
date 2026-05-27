import type { Decimal } from '@primitives/decimal.utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { ActionInfoSize } from '@ui-kit/shared/ui/ActionInfo/ActionInfo'
import { decimal, formatPercent as formatPercent } from '@ui-kit/utils'
import type { SlippageType } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { SlippageSettings } from '@ui-kit/widgets/SlippageSettings/SlippageSettings'
import type { SlippageSettingsFormData } from '@ui-kit/widgets/SlippageSettings/useSlipageSettingsForm'

export const SlippageToleranceActionInfoPure = ({
  maxSlippage,
  onSave,
  size,
}: {
  maxSlippage: Decimal
  onSave: (data: SlippageSettingsFormData) => void
  size?: ActionInfoSize
}) => (
  <ActionInfo
    label={t`Slippage`}
    value={formatPercent(maxSlippage)}
    valueRight={
      <SlippageSettings
        buttonSize="extraExtraSmall"
        buttonIcon={<GearIcon sx={{ color: 'text.primary' }} />}
        onSave={onSave}
      />
    }
    size={size}
    testId="borrow-slippage"
  />
)

/** Hooked up version of the slippage tolerance action info component that saves slippage in a store */
export const SlippageToleranceActionInfo = ({
  maxSlippage,
  stateKey,
  size,
}: {
  maxSlippage: string
  stateKey: SlippageType | string
  size?: ActionInfoSize
}) => {
  const setMaxSlippage = useUserProfileStore(state => state.setMaxSlippage)
  return (
    <SlippageToleranceActionInfoPure
      maxSlippage={decimal(maxSlippage)!}
      // todo: the following cast is incorrect, the new modal doesn't support string keys!
      onSave={slippage => setMaxSlippage(slippage[stateKey as SlippageType], stateKey)}
      size={size}
    />
  )
}
