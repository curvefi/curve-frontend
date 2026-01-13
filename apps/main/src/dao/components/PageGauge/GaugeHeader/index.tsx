import { styled } from 'styled-components'
import { SmallLabel } from '@/dao/components/SmallLabel'
import { GaugeFormattedData } from '@/dao/types/dao.types'
import { Box } from '@ui/Box'
import { Loader } from '@ui/Loader'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'

interface GaugeHeaderProps {
  gaugeData: GaugeFormattedData | undefined
  dataLoading: boolean
}

export const GaugeHeader = ({ gaugeData, dataLoading }: GaugeHeaderProps) => (
  <Wrapper variant="secondary">
    <BoxedDataComp>
      {gaugeData?.tokens && (
        <TokenIcons
          blockchainId={gaugeData?.pool?.chain ?? gaugeData?.market?.chain ?? ''}
          tokens={gaugeData?.tokens}
        />
      )}
      {dataLoading ? (
        <>
          <Loader isLightBg skeleton={[65, 28]} />
          <Loader isLightBg skeleton={[35, 28]} />
        </>
      ) : (
        <>
          <h3>{gaugeData?.title}</h3>
          {gaugeData?.is_killed && <SmallLabel description={t`Killed`} isKilled />}
          {gaugeData?.platform && <SmallLabel description={gaugeData?.platform} />}
          {gaugeData?.pool?.chain && <SmallLabel description={gaugeData?.pool.chain} isNetwork />}
          {gaugeData?.market?.chain && <SmallLabel description={gaugeData?.market.chain} isNetwork />}
        </>
      )}
    </BoxedDataComp>
  </Wrapper>
)

const Wrapper = styled(Box)`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
