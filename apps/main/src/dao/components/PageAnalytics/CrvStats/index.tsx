import styled from 'styled-components'
import MetricsComp, { MetricsColumnData } from '@/dao/components/MetricsComp'
import { useStatsVecrvQuery } from '@/dao/entities/stats-vecrv'
import useStore from '@/dao/store/useStore'
import type { CurveApi } from '@/dao/types/dao.types'
import Box from '@ui/Box'
import Tooltip from '@ui/Tooltip'
import { formatNumber } from '@ui/utils'
import { useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { Chain } from '@ui-kit/utils/network'

const CrvStats = () => {
  const { data: veCrvData, isLoading: statsLoading, isSuccess: statsSuccess } = useStatsVecrvQuery({})
  const { provider } = useWallet()
  const { lib: curve } = useConnection<CurveApi>()
  const chainId = curve?.chainId
  const veCrvFees = useStore((state) => state.analytics.veCrvFees)
  const veCrvHolders = useStore((state) => state.analytics.veCrvHolders)
  const usdRatesLoading = useStore((state) => state.usdRates.loading)
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)
  const crv = usdRatesMapper.crv

  // protect against trying to load data on non-mainnet networks
  const notMainnet = chainId !== Chain.Ethereum
  const noProvider = !provider || notMainnet
  const veCrvFeesLoading = veCrvFees.fetchStatus === 'LOADING'
  const aprLoading = statsLoading || veCrvFeesLoading || usdRatesLoading || !crv

  const veCrvApr =
    aprLoading || notMainnet || !statsSuccess
      ? 0
      : calculateApr(veCrvFees.fees[1].feesUsd, veCrvData.totalVeCrv.fromWei(), crv)

  const loading = Boolean(provider && statsLoading)

  return (
    <Wrapper>
      <Container>
        <h4>{t`VECRV METRICS`}</h4>
        <MetricsContainer>
          <MetricsComp
            loading={loading}
            title={t`Total CRV`}
            data={
              <MetricsColumnData>
                {noProvider || !statsSuccess
                  ? '-'
                  : formatNumber(veCrvData.totalCrv.fromWei(), { notation: 'compact' })}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={loading}
            title={t`Locked CRV`}
            data={
              <MetricsColumnData>
                {noProvider || !statsSuccess
                  ? '-'
                  : formatNumber(veCrvData.totalLockedCrv.fromWei(), { notation: 'compact' })}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={loading}
            title={t`veCRV`}
            data={
              <MetricsColumnData>
                {noProvider || !statsSuccess
                  ? '-'
                  : formatNumber(veCrvData.totalVeCrv.fromWei(), { notation: 'compact' })}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={veCrvHolders.fetchStatus === 'LOADING'}
            title={t`Holders`}
            data={
              <StyledTooltip
                tooltip={t`${veCrvHolders.canCreateVote} veCRV holders can create a new proposal (minimum 2500 veCRV is required)`}
              >
                <MetricsColumnData>
                  {formatNumber(veCrvHolders.totalHolders, { notation: 'compact' })}
                </MetricsColumnData>
              </StyledTooltip>
            }
          />
          <MetricsComp
            loading={loading}
            title={t`CRV Supply Locked`}
            data={
              <MetricsColumnData>
                {noProvider || !statsSuccess
                  ? '-'
                  : `${formatNumber(veCrvData.lockedPercentage, {
                      notation: 'compact',
                    })}%`}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={Boolean(provider && (statsLoading || veCrvFeesLoading || aprLoading))}
            title={t`veCRV APR`}
            data={
              <AprRow>
                <MetricsColumnData noMargin>
                  {noProvider || !statsSuccess ? '-' : `~${formatNumber(veCrvApr, { notation: 'compact' })}%`}
                </MetricsColumnData>
              </AprRow>
            }
          />
        </MetricsContainer>
      </Container>
    </Wrapper>
  )
}

const calculateApr = (fees: number, totalVeCrv: number, crvPrice: number) =>
  (((fees / totalVeCrv) * 52) / crvPrice) * 100

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

const StyledTooltip = styled(Tooltip)`
  min-height: 0;
`

const AprRow = styled.div`
  display: flex;
  gap: 0 var(--spacing-1);
  padding-top: var(--spacing-1);
  align-items: flex-end;
`

export default CrvStats
