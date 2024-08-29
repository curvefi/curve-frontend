import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import Tooltip from '@/ui/Tooltip'

const CrvStats: React.FC = () => {
  const { provider } = useStore((state) => state.wallet)
  const { veCrvData, getVeCrvData, veCrvFees, veCrvHolders } = useStore((state) => state.vecrv)

  const veCrvLoading = veCrvData.fetchStatus === 'LOADING'
  const veCrvFeesLoading = veCrvFees.fetchStatus === 'LOADING'

  useEffect(() => {
    if (provider && veCrvData.totalCrv === 0 && veCrvData.fetchStatus !== 'ERROR') {
      getVeCrvData(provider)
    }
  }, [veCrvData.totalCrv, veCrvData.fetchStatus, getVeCrvData, provider])

  const veCrvApr =
    veCrvLoading || veCrvFeesLoading ? 0 : (((veCrvFees.fees[1].fees_usd / veCrvData.totalVeCrv) * 52) / 0.3) * 100

  return (
    <Wrapper>
      <Container>
        <h4>{t`VECRV METRICS`}</h4>
        <MetricsContainer>
          <MetricsComp
            loading={veCrvLoading}
            title={t`Total CRV`}
            data={
              <MetricsColumnData>
                {formatNumber(veCrvData.totalCrv, { showDecimalIfSmallNumberOnly: true })}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={veCrvLoading}
            title={t`Locked CRV`}
            data={
              <MetricsColumnData>
                {formatNumber(veCrvData.totalLockedCrv, { showDecimalIfSmallNumberOnly: true })}
              </MetricsColumnData>
            }
          />
          <MetricsComp
            loading={veCrvLoading}
            title={t`veCRV`}
            data={
              <MetricsColumnData>
                {formatNumber(veCrvData.totalVeCrv, { showDecimalIfSmallNumberOnly: true })}
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
                  {formatNumber(veCrvHolders.totalHolders, { showDecimalIfSmallNumberOnly: true })}
                </MetricsColumnData>
              </StyledTooltip>
            }
          />
          <MetricsComp
            loading={veCrvLoading}
            title={t`CRV Supply Locked`}
            data={
              <MetricsColumnData>{`${formatNumber(veCrvData.lockedPercentage, {
                showDecimalIfSmallNumberOnly: true,
              })}%`}</MetricsColumnData>
            }
          />
          <MetricsComp
            loading={veCrvLoading || veCrvFeesLoading}
            title={t`veCRV APR`}
            data={
              <AprRow>
                <MetricsColumnData noMargin>{`~${veCrvApr.toFixed(2)}%`}</MetricsColumnData>
              </AprRow>
            }
          />
        </MetricsContainer>
      </Container>
    </Wrapper>
  )
}

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
  background-color: var(--box_header--secondary--background-color);
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
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--spacing-3) var(--spacing-4);
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
