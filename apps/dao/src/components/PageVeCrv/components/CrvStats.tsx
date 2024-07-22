import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import SubTitleColumn, { SubTitleColumnData } from '@/components/SubTitleColumn'
import { TooltipIcon } from '@/ui/Tooltip'

const CrvStats: React.FC = () => {
  const { provider } = useStore((state) => state.wallet)
  const { veCrvData, getVeCrvData, veCrvFees } = useStore((state) => state.vecrv)

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
    <Wrapper variant="secondary">
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
            <Box flex flexGap="var(--spacing-1)">
              <SubTitleColumnData>
                {`~${formatNumber(veCrvApr, {
                  showDecimalIfSmallNumberOnly: true,
                })}%`}
              </SubTitleColumnData>
              <TooltipIcon>
                {t`This APR is an annualized projection based on the previous week's fee distribution.`}
              </TooltipIcon>
            </Box>
          }
        />
      </StatsRow>
    </Wrapper>
  )
}

const Wrapper = styled(Box)``

const StatsRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

export default CrvStats
