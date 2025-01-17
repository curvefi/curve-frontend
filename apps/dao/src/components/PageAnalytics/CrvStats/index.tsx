import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import Tooltip from '@/ui/Tooltip'

const CrvStats: React.FC = () => {
  const provider = useStore((state) => state.wallet.getProvider(''))
  const { veCrvData, getVeCrvData, veCrvFees, veCrvHolders } = useStore((state) => state.analytics)
  const { loading: usdRatesLoading, usdRatesMapper } = useStore((state) => state.usdRates)
  const crv = usdRatesMapper.crv

  const noProvider = !provider
  const veCrvLoading = veCrvData.fetchStatus === 'LOADING'
  const veCrvFeesLoading = veCrvFees.fetchStatus === 'LOADING'
  const aprLoading = veCrvLoading || veCrvFeesLoading || usdRatesLoading || !crv

  useEffect(() => {
    if (provider && veCrvData.totalCrv === 0 && veCrvData.fetchStatus !== 'ERROR') {
      getVeCrvData(provider)
    }
  }, [veCrvData.totalCrv, veCrvData.fetchStatus, getVeCrvData, provider])

  const veCrvApr = aprLoading ? 0 : calculateApr(veCrvFees.fees[1].fees_usd, veCrvData.totalVeCrv, crv)

  const loading = Boolean(provider && veCrvLoading)
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
                {noProvider ? '-' : formatNumber(veCrvData.totalCrv, { notation: 'compact' })}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={loading}
            title={t`Locked CRV`}
            data={
              <MetricsColumnData>
                {noProvider ? '-' : formatNumber(veCrvData.totalLockedCrv, { notation: 'compact' })}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={loading}
            title={t`veCRV`}
            data={
              <MetricsColumnData>
                {noProvider ? '-' : formatNumber(veCrvData.totalVeCrv, { notation: 'compact' })}
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
                {noProvider
                  ? '-'
                  : `${formatNumber(veCrvData.lockedPercentage, {
                      notation: 'compact',
                    })}%`}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={Boolean(provider && (veCrvLoading || veCrvFeesLoading || aprLoading))}
            title={t`veCRV APR`}
            data={
              <AprRow>
                <MetricsColumnData noMargin>
                  {noProvider ? '-' : `~${formatNumber(veCrvApr, { notation: 'compact' })}%`}
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
