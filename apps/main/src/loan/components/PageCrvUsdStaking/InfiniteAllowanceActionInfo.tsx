import { Switch } from '@/loan/components/PageCrvUsdStaking/components/Switch'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'

type ScrvUsdInfiniteAllowanceActionInfoProps = { approveInfinite: boolean; onToggle: () => void }

export const InfiniteAllowanceActionInfo = ({ approveInfinite, onToggle }: ScrvUsdInfiniteAllowanceActionInfoProps) => (
  <ActionInfo
    label={t`Infinite allowance`}
    value="" // do not pass null/undefined as that renders fallback
    valueRight={<Switch isActive={approveInfinite} isSelected={approveInfinite} onChange={onToggle} />}
    size="small"
    testId="scrvusd-infinite-allowance"
  />
)
