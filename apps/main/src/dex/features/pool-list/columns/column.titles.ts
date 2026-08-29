import { useMemo } from 'react'
import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { PoolColumnId } from './columns.enum'

const getPoolTitles = (rateDisplay: ReturnType<typeof useRateDisplay>): Record<PoolColumnId, string> => ({
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.Tokens]: t`Tokens`,
  [PoolColumnId.NetRate]: rateDisplay === 'apy' ? t`Net APY` : t`Net APR`,
  [PoolColumnId.BaseRate]: rateDisplay === 'apy' ? t`Base APY` : t`Base APR`,
  [PoolColumnId.WeeklyBaseRate]: rateDisplay === 'apy' ? t`7D base APY` : t`7D base APR`,
  [PoolColumnId.RewardsRate]: rateDisplay === 'apy' ? t`Rewards APY` : t`Rewards APR`,
  [PoolColumnId.CrvRate]: rateDisplay === 'apy' ? t`CRV APY` : t`CRV APR`,
  [PoolColumnId.Points]: t`Points`,
  [PoolColumnId.Volume]: t`1D vol`,
  [PoolColumnId.Tvl]: t`TVL`,
  [PoolColumnId.Age]: t`Age`,
})

export const usePoolTitles = () => {
  const rateDisplay = useRateDisplay()
  return useMemo(() => getPoolTitles(rateDisplay), [rateDisplay])
}
