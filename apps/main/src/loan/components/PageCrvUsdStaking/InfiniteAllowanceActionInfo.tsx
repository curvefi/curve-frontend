import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import Switch from '@mui/material/Switch'
import { t } from '@ui/lib/i18n'

type ScrvUsdInfiniteAllowanceActionInfoProps = { approveInfinite: boolean; onToggle: () => void }

export const InfiniteAllowanceActionInfo = ({ approveInfinite, onToggle }: ScrvUsdInfiniteAllowanceActionInfoProps) => (
  <ActionInfo
    label={t`Infinite allowance`}
    value="" // do not pass null/undefined as that renders fallback
    valueRight={<Switch size="small" checked={approveInfinite} onChange={onToggle} />}
    size="small"
    testId="scrvusd-infinite-allowance"
  />
)
