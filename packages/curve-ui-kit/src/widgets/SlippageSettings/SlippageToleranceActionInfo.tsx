import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { decimal, Decimal, formatPercent as formatPercent } from '@ui-kit/utils'
import { SlippageSettings } from '@ui-kit/widgets/SlippageSettings/SlippageSettings'

export const SlippageToleranceActionInfoPure = ({
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

/** Hooked up version of the slippage tolerance action info component that saves slippage in a store */
export const SlippageToleranceActionInfo = ({ maxSlippage, stateKey }: { maxSlippage: string; stateKey?: string }) => {
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)

  return (
    <SlippageToleranceActionInfoPure
      maxSlippage={decimal(maxSlippage)!}
      onSave={(slippage: string) => setMaxSlippage(slippage, stateKey)}
    />
  )
}
