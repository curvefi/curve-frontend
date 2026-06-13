import lodash from 'lodash'
import { styled } from 'styled-components'
import { useStatsVecrvQuery } from '@/dao/entities/stats-vecrv'
import { useStore } from '@/dao/store/useStore'
import { maybe } from '@primitives/objects.utils'
import { Box } from '@ui/Box'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { combineQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { mapQuery, q } from '@ui-kit/types/util'
import { formatNumber, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'

function useVeCrvFees() {
  const veCrvFees = useStore(state => state.analytics.veCrvFees)
  return { data: veCrvFees, isLoading: veCrvFees.fetchStatus === 'LOADING', error: null }
}

export const CrvStats = () => {
  const { curveApi: { chainId } = {} } = useCurve()
  const statsQuery = useStatsVecrvQuery({})
  const veCrvHolders = useStore(state => state.analytics.veCrvHolders)
  const crvUsdRate = useTokenUsdRate({ chainId, tokenAddress: MAINNET_CRV_ADDRESS })
  const veCrv = useVeCrvFees()

  const veCrvApr = combineQueries([statsQuery, crvUsdRate, veCrv], (veCrvData, crv, { fees }) =>
    chainId === Chain.Ethereum
      ? {
          current: calculateApr(fees[1].feesUsd, veCrvData.totalVeCrv.fromWei(), crv),
          fourDayAverage: calculateFourWeekAverageApr(
            fees.slice(1, 5).map(fee => fee.feesUsd),
            veCrvData.totalVeCrv.fromWei(),
            crv,
          ),
        }
      : { current: 0, fourDayAverage: 0 },
  )

  return (
    <Wrapper>
      <Container>
        <h4>{t`VECRV METRICS`}</h4>
        <MetricsContainer>
          <Metric
            size="small"
            label={t`Total CRV`}
            value={mapQuery(statsQuery, ({ totalCrv }) => totalCrv.fromWei())}
            valueOptions={{}}
          />
          <Metric
            size="small"
            label={t`Locked CRV`}
            value={mapQuery(statsQuery, ({ totalLockedCrv }) => totalLockedCrv.fromWei())}
            valueOptions={{}}
          />
          <Metric
            size="small"
            label={t`veCRV`}
            value={mapQuery(statsQuery, ({ totalVeCrv }) => totalVeCrv.fromWei())}
            valueOptions={{}}
          />
          <Metric
            size="small"
            label={t`Holders`}
            value={q({
              data: veCrvHolders.totalHolders,
              isLoading: veCrvHolders.fetchStatus === 'LOADING',
              error: null,
            })}
            valueOptions={{ abbreviate: false, decimals: 0 }}
            labelTooltip={{
              title: t`${veCrvHolders.canCreateVote} veCRV holders can create a new proposal (minimum 2500 veCRV is required)`,
            }}
          />
          <Metric
            size="small"
            label={t`CRV Supply Locked`}
            value={mapQuery(statsQuery, ({ lockedPercentage }) => lockedPercentage)}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            size="small"
            label={t`veCRV APR`}
            value={mapQuery(veCrvApr, ({ current }) => current)}
            valueOptions={{ unit: 'percentage' }}
            notional={maybe(veCrvApr.data?.fourDayAverage, apr => `${formatNumber(apr, 'percent.value')} 4w avg`)}
          />
        </MetricsContainer>
      </Container>
    </Wrapper>
  )
}

const calculateApr = (fees: number, totalVeCrv: number, crvPrice: number) =>
  (((fees / totalVeCrv) * 52) / crvPrice) * 100

const calculateFourWeekAverageApr = (fees: number[], totalVeCrv: number, crvPrice: number) =>
  lodash.meanBy(fees, fee => calculateApr(fee, totalVeCrv, crvPrice))

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  background-color: var(--box--secondary--background-color);
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--box--secondary--background-color);
  @media (min-width: 20.625rem) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
  @media (min-width: 48rem) {
    display: flex;
    column-gap: var(--spacing-4);
  }
`

const MetricsContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3) var(--spacing-4);
  @media (min-width: 28.125rem) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
