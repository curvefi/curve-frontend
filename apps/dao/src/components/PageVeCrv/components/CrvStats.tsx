import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import SubTitleColumn, { SubTitleColumnData } from '@/components/SubTitleColumn'

const CrvStats = () => {
  const { provider } = useStore((state) => state.wallet)
  const { veCrvData, getVeCrvData } = useStore((state) => state.vecrv)

  useEffect(() => {
    if (provider && veCrvData.totalCrv === 0 && veCrvData.fetchStatus !== 'ERROR') {
      getVeCrvData(provider)
    }
  }, [veCrvData.totalCrv, veCrvData.fetchStatus, getVeCrvData, provider])

  return (
    <Wrapper variant="secondary">
      <StatsRow>
        <SubTitleColumn
          loading={veCrvData.fetchStatus === 'LOADING'}
          title={t`Total CRV`}
          data={
            <SubTitleColumnData>
              {formatNumber(veCrvData.totalCrv, { showDecimalIfSmallNumberOnly: true })}
            </SubTitleColumnData>
          }
        />
        <SubTitleColumn
          loading={veCrvData.fetchStatus === 'LOADING'}
          title={t`Total veCRV`}
          data={
            <SubTitleColumnData>
              {formatNumber(veCrvData.totalVeCrv, { showDecimalIfSmallNumberOnly: true })}
            </SubTitleColumnData>
          }
        />
        <SubTitleColumn
          loading={veCrvData.fetchStatus === 'LOADING'}
          title={t`Locked Percentage`}
          data={
            <SubTitleColumnData>{`${formatNumber(veCrvData.lockedPercentage, {
              showDecimalIfSmallNumberOnly: true,
            })}%`}</SubTitleColumnData>
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
  gap: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

export default CrvStats
