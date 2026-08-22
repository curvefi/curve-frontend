import { t } from '@evm-ui/lib/i18n'
import { PoolColumnId } from './columns.enum'

export const POOL_TITLES: Record<PoolColumnId, string> = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.NetApy]: t`Net APY`,
  [PoolColumnId.BaseApy]: t`Base APY`,
  [PoolColumnId.WeeklyBaseApy]: t`7D base APY`,
  [PoolColumnId.RewardsApy]: t`Rewards APY`,
  [PoolColumnId.CrvApy]: t`CRV APY`,
  [PoolColumnId.Points]: t`Points`,
  [PoolColumnId.Volume]: t`1D vol`,
  [PoolColumnId.Tvl]: t`TVL`,
  [PoolColumnId.Age]: t`Age`,
}
