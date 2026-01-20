import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { CONTRACT_CRV } from '@/dao/constants'
import { useStatsVecrvQuery } from '@/dao/entities/stats-vecrv'
import { useStore } from '@/dao/store/useStore'
import { Box } from '@ui/Box'
import { useCurve, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { formatNumber } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'

export const CrvStats = () => {
  const { data: veCrvData, isLoading: statsLoading, isSuccess: statsSuccess } = useStatsVecrvQuery({})
  const { provider } = useWallet()
  const { curveApi: { chainId } = {} } = useCurve()
  const veCrvFees = useStore((state) => state.analytics.veCrvFees)
  const veCrvHolders = useStore((state) => state.analytics.veCrvHolders)
  const { data: crv, isFetching: isLoadingCrv } = useTokenUsdRate({ chainId, tokenAddress: CONTRACT_CRV })

  // protect against trying to load data on non-mainnet networks
  const notMainnet = chainId !== Chain.Ethereum
  const noProvider = !provider || notMainnet
  const veCrvFeesLoading = veCrvFees.fetchStatus === 'LOADING'
  const aprLoading = statsLoading || veCrvFeesLoading || isLoadingCrv || crv == null

  const veCrvApr = useMemo(
    () =>
      aprLoading || notMainnet || !statsSuccess
        ? { current: 0, fourDayAverage: 0 }
        : {
            current: calculateApr(veCrvFees.fees[1].feesUsd, veCrvData.totalVeCrv.fromWei(), crv),
            fourDayAverage: calculateFourWeekAverageApr(
              veCrvFees.fees.slice(1, 5).map((fee) => fee.feesUsd),
              veCrvData.totalVeCrv.fromWei(),
              crv,
            ),
          },
    [aprLoading, notMainnet, statsSuccess, veCrvFees, veCrvData, crv],
  )

  const loading = Boolean(provider && statsLoading)

  return (
    <Wrapper>
      <Container>
        <h4>{t`VECRV METRICS`}</h4>
        <MetricsContainer>
          <Metric
            size="small"
            label={t`Total CRV`}
            value={noProvider || !statsSuccess ? null : veCrvData.totalCrv.fromWei()}
            loading={loading}
            valueOptions={{}}
          />
          <Metric
            size="small"
            loading={loading}
            label={t`Locked CRV`}
            value={noProvider || !statsSuccess ? null : veCrvData.totalLockedCrv.fromWei()}
            valueOptions={{}}
          />
          <Metric
            size="small"
            loading={loading}
            label={t`veCRV`}
            value={noProvider || !statsSuccess ? null : veCrvData.totalVeCrv.fromWei()}
            valueOptions={{}}
          />
          <Metric
            size="small"
            loading={veCrvHolders.fetchStatus === 'LOADING'}
            label={t`Holders`}
            value={veCrvHolders.totalHolders}
            valueOptions={{ abbreviate: false, decimals: 0 }}
            labelTooltip={{
              title: t`${veCrvHolders.canCreateVote} veCRV holders can create a new proposal (minimum 2500 veCRV is required)`,
            }}
          />
          <Metric
            size="small"
            loading={loading}
            label={t`CRV Supply Locked`}
            value={noProvider || !statsSuccess ? null : veCrvData.lockedPercentage}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            size="small"
            loading={Boolean(loading || veCrvFeesLoading || aprLoading)}
            label={t`veCRV APR`}
            value={noProvider || !statsSuccess ? null : veCrvApr.current}
            valueOptions={{ unit: 'percentage' }}
            notional={
              loading || veCrvFeesLoading || aprLoading
                ? undefined
                : `${formatNumber(veCrvApr.fourDayAverage, { unit: 'percentage', abbreviate: false })} 4w avg`
            }
          />
        </MetricsContainer>
      </Container>
    </Wrapper>
  )
}

const calculateApr = (fees: number, totalVeCrv: number, crvPrice: number) =>
  (((fees / totalVeCrv) * 52) / crvPrice) * 100

const calculateFourWeekAverageApr = (fees: number[], totalVeCrv: number, crvPrice: number) =>
  lodash.meanBy(fees, (fee) => calculateApr(fee, totalVeCrv, crvPrice))

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
