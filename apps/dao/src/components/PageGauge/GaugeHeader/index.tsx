import styled from 'styled-components'
import { t } from '@lingui/macro'

import networks from '@/networks'
import { copyToClipboard } from '@/utils'
import { breakpoints } from 'ui/src/utils'

import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import TooltipButton from '@/ui/Tooltip'
import { ExternalLink } from '@/ui/Link'
import Loader from '@/ui/Loader'

interface GaugeHeaderProps {
  gaugeAddress: string
  gaugeData: GaugeFormattedData
  dataLoading: boolean
}

const GaugeHeader = ({ gaugeAddress, gaugeData, dataLoading }: GaugeHeaderProps) => {
  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  return (
    <Wrapper variant="secondary">
      <BoxedDataComp>
        {dataLoading ? (
          <>
            <Loader isLightBg skeleton={[65, 25]} />
            <Loader isLightBg skeleton={[35, 25]} />
          </>
        ) : (
          <>
            <h3>{gaugeData.title}</h3>
            {gaugeData.is_killed && <BoxedData isKilled>{t`Killed`}</BoxedData>}
            {gaugeData.platform && <BoxedData>{gaugeData.platform}</BoxedData>}
            {gaugeData.pool?.chain && <BoxedData>{gaugeData.pool.chain}</BoxedData>}
            {gaugeData.market?.chain && <BoxedData>{gaugeData.market.chain}</BoxedData>}
          </>
        )}
      </BoxedDataComp>
      <Box flex flexColumn flexGap="var(--spacing-2)">
        <Box flex flexDirection="column">
          <AddressTitle>{t`Gauge Address:`}</AddressTitle>
          <Box flex flexAlignItems="center" flexJustifyContent="space-between" flexGap="var(--spacing-2)">
            <Address>{gaugeAddress}</Address>{' '}
            <Box flex flexAlignItems="center">
              <TooltipButton onClick={() => handleCopyClick(gaugeAddress)} noWrap tooltip={t`Copy address`}>
                <Icon name="Copy" size={16} />
              </TooltipButton>
              <StyledExternalLink size="small" href={networks[1].scanAddressPath(gaugeAddress)}>
                <Icon name="Launch" size={16} />
              </StyledExternalLink>
            </Box>
          </Box>
        </Box>
        {gaugeData?.pool?.address && (
          <Box flex flexDirection="column">
            <AddressTitle>{t`Pool Address:`}</AddressTitle>
            <Box flex flexAlignItems="center" flexJustifyContent="space-between" flexGap="var(--spacing-2)">
              <Address>{gaugeData.pool?.address}</Address>{' '}
              <Box flex flexAlignItems="center">
                <TooltipButton
                  onClick={() => handleCopyClick(gaugeData.pool?.address ?? '')}
                  noWrap
                  tooltip={t`Copy address`}
                >
                  <Icon name="Copy" size={16} />
                </TooltipButton>
                <StyledExternalLink size="small" href={networks[1].scanAddressPath(gaugeData.pool?.address)}>
                  <Icon name="Launch" size={16} />
                </StyledExternalLink>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
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

const StyledCopyButton = styled(IconButton)`
  margin-left: var(--spacing-1);
  &:hover {
    color: var(--button_icon--hover--color);
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
  min-height: var(--height-small);
  min-width: var(--height-small);
  margin-bottom: 0.1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    min-height: 16px;
    min-width: 16px;
  }
  &:hover {
    color: var(--button_icon--hover--color);
    opacity: 1;
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

const AddressTitle = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.6;
`

const Address = styled.p`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const BoxedDataComp = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  grid-row: 1 / 2;
  margin-left: auto;
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

const BoxedData = styled.p<{ isKilled?: boolean }>`
  padding: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  text-transform: capitalize;
  margin: auto 0 0;
  border: 1px solid ${({ isKilled }) => (isKilled ? 'var(--chart-red)' : 'var(--gray-500);')};
  color: ${({ isKilled }) => (isKilled ? 'var(--chart-red)' : 'inherit')};
  @media (min-width: 33.125rem) {
    margin: 0;
  }
`

export default GaugeHeader
