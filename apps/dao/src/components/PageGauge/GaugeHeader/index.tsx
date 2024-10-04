import styled from 'styled-components'
import { t } from '@lingui/macro'

import Box from '@/ui/Box'
import Loader from '@/ui/Loader'
import SmallLabel from '@/components/SmallLabel'

interface GaugeHeaderProps {
  gaugeData: GaugeFormattedData
  dataLoading: boolean
}

const GaugeHeader = ({ gaugeData, dataLoading }: GaugeHeaderProps) => {
  return (
    <Wrapper variant="secondary">
      <BoxedDataComp>
        {dataLoading ? (
          <>
            <Loader isLightBg skeleton={[65, 28]} />
            <Loader isLightBg skeleton={[35, 28]} />
          </>
        ) : (
          <>
            <h3>{gaugeData.title}</h3>
            {gaugeData.is_killed && <SmallLabel description={t`Killed`} isKilled />}
            {gaugeData.platform && <SmallLabel description={gaugeData.platform} />}
            {gaugeData.pool?.chain && <SmallLabel description={gaugeData.pool.chain} isNetwork />}
            {gaugeData.market?.chain && <SmallLabel description={gaugeData.market.chain} isNetwork />}
          </>
        )}
      </BoxedDataComp>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

const BoxedDataComp = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  grid-row: 1 / 2;
  margin-right: var(--spacing-2);
  @media (min-width: 33.125rem) {
    display: flex;
    flex-direction: row;
    margin-left: 0;
  }
  h3 {
    margin-right: var(--spacing-1);
  }
`

export default GaugeHeader
