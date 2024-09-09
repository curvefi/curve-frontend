import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { formatNumber } from '@/ui/utils'
import networks from '@/networks'

import Box from '@/ui/Box'
import InternalLinkButton from '@/components/InternalLinkButton'
import TitleComp from '@/components/PageGauges/GaugeList/TitleComp'

type GaugeVoteItemProps = {
  gauge: UserGaugeVoteWeight
  gridTemplateColumns: string
}

const GaugeVoteItem = ({ gauge, gridTemplateColumns }: GaugeVoteItemProps) => {
  const gaugeMapperData = useStore((state) => state.gauges.gaugeMapper[gauge.gaugeAddress])

  const imageBaseUrl = networks[1].imageBaseUrl

  return (
    <Wrapper key={gauge.gaugeAddress} gridTemplateColumns={gridTemplateColumns}>
      <Box flex flexColumn flexGap="var(--spacing-2)">
        <TitleComp gaugeData={gaugeMapperData} imageBaseUrl={imageBaseUrl} gaugeAddress={gauge.gaugeAddress} />
      </Box>
      <BoxColumn>
        <GaugeData>{gauge.userPower}%</GaugeData>
      </BoxColumn>
      <BoxColumn>
        <GaugeData>{formatNumber(gauge.userVeCrv, { showDecimalIfSmallNumberOnly: true })}</GaugeData>
      </BoxColumn>
      <InternalLinkButton smallSize to={`/ethereum/gauges/${gauge.gaugeAddress}`}>
        {t`VIEW GAUGE`}
      </InternalLinkButton>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ gridTemplateColumns: string }>`
  display: grid;
  padding: var(--spacing-2) 0 calc(var(--spacing-2) + var(--spacing-1));
  width: 100%;
  gap: var(--spacing-2);
  border-bottom: 1px solid var(--gray-500a20);
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  &:last-child {
    border-bottom: none;
  }
`

const BoxColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-2);
  margin: auto 0 auto auto;
  &:first-child {
    margin-left: var(--spacing-2);
  }
  &:last-child {
    margin-right: var(--spacing-2);
  }
`

const GaugeData = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-align: right;
`

export default GaugeVoteItem
