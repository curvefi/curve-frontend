import { t } from '@ui/lib/i18n'
import { PoolColumnId } from './columns.enum'

export const POOL_TITLES: Record<PoolColumnId, string> = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.Tokens]: t`Tokens`,
  [PoolColumnId.NetRate]: t`Net APR`,
  [PoolColumnId.BaseRate]: t`Base APR`,
  [PoolColumnId.WeeklyBaseRate]: t`7D base APR`,
  [PoolColumnId.RewardsRate]: t`Rewards APR`,
  [PoolColumnId.CrvRate]: t`CRV APR`,
  [PoolColumnId.Points]: t`Points`,
  [PoolColumnId.Volume]: t`1D vol`,
  [PoolColumnId.Tvl]: t`TVL`,
  [PoolColumnId.Age]: t`Age`,
}
