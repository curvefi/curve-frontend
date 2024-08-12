import styled from 'styled-components'

import networks from '@/networks'
import { copyToClipboard } from '@/utils'

import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import { ExternalLink } from '@/ui/Link'

interface GaugeHeaderProps {
  gaugeAddress: string
}

const GaugeHeader = ({ gaugeAddress }: GaugeHeaderProps) => {
  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  return (
    <Wrapper variant="secondary">
      <Box flex flexAlignItems="center">
        <h3>{gaugeAddress}</h3>{' '}
        <StyledCopyButton size="small" onClick={() => handleCopyClick(gaugeAddress)}>
          <Icon name="Copy" size={16} />
        </StyledCopyButton>
        <StyledExternalLink size="small" href={networks[1].scanAddressPath(gaugeAddress)}>
          <Icon name="Launch" size={16} />
        </StyledExternalLink>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
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
  &:hover {
    color: var(--button_icon--hover--color);
    opacity: 1;
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

export default GaugeHeader
