import type { BoxProps } from '@/ui/Box/types'

import styled from 'styled-components'

import { copyToClipboard } from '@/utils/helpers'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'

import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import TextEllipsis from '@/ui/TextEllipsis'
import TokenIcon from '@/components/TokenIcon'
import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

const TokenLabel = ({
  rChainId,
  token,
  isDisplayOnly,
  isVisible = true,
  showLeverageIcon,
  ...boxProps
}: BoxProps & {
  rChainId: ChainId
  token: OneWayMarketTemplate['borrowed_token'] | OneWayMarketTemplate['collateral_token'] | undefined
  isDisplayOnly?: boolean
  isVisible?: boolean
  showLeverageIcon?: boolean
}) => {
  const { address = '', symbol = '' } = token ?? {}

  const TokenIconComp = (
    <ExternalLinkTokenWrapper>
      <StyledTokenIcon
        size="sm"
        imageBaseUrl={isVisible ? helpers.getImageBaseUrl(rChainId) : ''}
        token={symbol}
        address={address}
      />
      <ExternalLinkToken>{symbol}</ExternalLinkToken>
    </ExternalLinkTokenWrapper>
  )

  return (
    <Box flex {...boxProps}>
      {isDisplayOnly ? (
        TokenIconComp
      ) : (
        <>
          <StyledExternalLink href={networks[rChainId].scanTokenPath(address)}>{TokenIconComp}</StyledExternalLink>
          <StyledIconButton
            size="medium"
            onClick={(evt) => {
              console.log(`Copied ${address}`)
              evt.stopPropagation()
              copyToClipboard(address)
            }}
          >
            <Icon name="Copy" size={16} />
          </StyledIconButton>
        </>
      )}
    </Box>
  )
}

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ExternalLinkTokenWrapper = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

const ExternalLinkToken = styled(TextEllipsis)`
  font-weight: bold;
  text-transform: initial;
`

const StyledIconButton = styled(IconButton)`
  align-items: center;
  display: inline-flex;

  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  :hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`

export default TokenLabel
