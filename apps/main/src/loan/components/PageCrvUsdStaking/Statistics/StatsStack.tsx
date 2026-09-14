import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics.query'
import { useScrvUsdSupplies } from '@/loan/entities/scrvusd-supplies.query'
import type { ChainId } from '@/loan/types/loan.types'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { weiToEther } from '@evm-ui/utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

const CRVUSD_OPTION = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }
const METRIC_CATEGORY = 'loan.scrvusdStats'

type StatsStackProps = { chainId: ChainId | undefined }

export const StatsStack = ({ chainId }: StatsStackProps) => {
  const supplies = useScrvUsdSupplies({ chainId })
  const revenue = useScrvUsdRevenue({})
  return (
    <MetricsGrid variant="mobileRows">
      <Metric
        category={METRIC_CATEGORY}
        label="Total crvUSD Staked"
        value={mapQuery(supplies, s => s.crvUSD)}
        valueOptions={{ unit: CRVUSD_OPTION }}
        copyText={t`Copied total crvUSD staked`}
      />
      <Metric
        category={METRIC_CATEGORY}
        label="Current projected APY"
        value={mapQuery(useScrvUsdStatistics({}), ({ apyProjected }) => apyProjected)}
        valueOptions={{ unit: 'percentage' }}
        copyText={t`Copied current projected APY`}
      />
      <Metric
        category={METRIC_CATEGORY}
        label="Total Revenue Distributed"
        value={mapQuery(revenue, ({ totalDistributed }) =>
          totalDistributed ? weiToEther(Number(totalDistributed)) : undefined,
        )}
        valueOptions={{ unit: CRVUSD_OPTION }}
        copyText={t`Copied total revenue distributed`}
      />
      <Metric
        category={METRIC_CATEGORY}
        label="Weekly Accumulated Revenue"
        value={mapQuery(revenue, ({ epochs }) => epochs[epochs.length - 1].weeklyRevenue)}
        valueOptions={{ unit: CRVUSD_OPTION }}
        copyText={t`Copied weekly accumulated revenue`}
      />
    </MetricsGrid>
  )
}
