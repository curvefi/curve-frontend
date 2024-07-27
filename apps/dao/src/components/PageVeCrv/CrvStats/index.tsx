import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import SubTitleColumn, { SubTitleColumnData } from '@/components/SubTitleColumn'
import Tooltip, { TooltipIcon } from '@/ui/Tooltip'

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
      <StatsRow>
        <SubTitleColumn
          loading={veCrvLoading}
          title={t`Total CRV`}
          data={
            <SubTitleColumnData>
              {formatNumber(veCrvData.totalCrv, { showDecimalIfSmallNumberOnly: true })}
            </SubTitleColumnData>
          }
        />
        <SubTitleColumn
          loading={veCrvLoading}
          title={t`Total Locked CRV`}
          data={
            <SubTitleColumnData>
              {formatNumber(veCrvData.totalLockedCrv, { showDecimalIfSmallNumberOnly: true })}
            </SubTitleColumnData>
          }
        />
        <SubTitleColumn
          loading={veCrvLoading}
          title={t`Total veCRV`}
          data={
            <SubTitleColumnData>
              {formatNumber(veCrvData.totalVeCrv, { showDecimalIfSmallNumberOnly: true })}
            </SubTitleColumnData>
          }
        />
        <SubTitleColumn
          loading={veCrvHolders.fetchStatus === 'LOADING'}
          title={t`Total Holders`}
          data={
            <StyledTooltip
              tooltip={t`${veCrvHolders.canCreateVote} veCRV holders can create a new proposal (minimum 2500 veCRV is required)`}
            >
              <SubTitleColumnData>
                {formatNumber(veCrvHolders.totalHolders, { showDecimalIfSmallNumberOnly: true })}
              </SubTitleColumnData>
            </StyledTooltip>
          }
        />
        <SubTitleColumn
          loading={veCrvLoading}
          title={t`% Locked`}
          data={
            <SubTitleColumnData>{`${formatNumber(veCrvData.lockedPercentage, {
              showDecimalIfSmallNumberOnly: true,
            })}%`}</SubTitleColumnData>
          }
        />
        <SubTitleColumn
          loading={veCrvLoading || veCrvFeesLoading}
          title={t`veCRV APR`}
          data={
            <AprRow>
              <SubTitleColumnData noMargin>
                {`~${formatNumber(veCrvApr, {
                  showDecimalIfSmallNumberOnly: true,
                })}%`}
              </SubTitleColumnData>
            </AprRow>
          }
        />
      </StatsRow>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  border-bottom: 1px solid var(--gray-500a20);
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
  row-gap: var(--spacing-3);
  column-gap: var(--spacing-4);
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
