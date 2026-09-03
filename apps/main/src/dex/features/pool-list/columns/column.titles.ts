import { t } from '@evm-ui/lib/i18n'
import { PoolColumnId } from './columns.enum'

export const POOL_TITLES: Record<PoolColumnId, string> = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.Tokens]: t`Tokens`,
  [PoolColumnId.NetApy]: t`Net APR`,
  [PoolColumnId.BaseApy]: t`Base APR`,
  [PoolColumnId.WeeklyBaseApy]: t`7D base APR`,
  [PoolColumnId.RewardsApy]: t`Rewards APR`,
  [PoolColumnId.CrvApy]: t`CRV APR`,
  [PoolColumnId.Points]: t`Points`,
  [PoolColumnId.Volume]: t`1D vol`,
  [PoolColumnId.Tvl]: t`TVL`,
  [PoolColumnId.Age]: t`Age`,
}
