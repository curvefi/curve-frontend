import { styled } from 'styled-components'
import { networks } from '@/lend/networks'
import { ChainId, type OneWayMarketTemplate } from '@/lend/types/lend.types'
import { Box } from '@ui/Box'
import type { BoxProps } from '@ui/Box/types'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { TextEllipsis } from '@ui/TextEllipsis'
import { scanTokenPath } from '@ui/utils'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { copyToClipboard } from '@ui-kit/utils'

export const TokenLabel = ({
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
        blockchainId={isVisible ? networks[rChainId].networkId : ''}
        tooltip={symbol}
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
          <StyledExternalLink href={scanTokenPath(networks[rChainId], address)}>{TokenIconComp}</StyledExternalLink>
          <StyledIconButton
            size="medium"
            onClick={(evt) => {
              evt.stopPropagation()
              void copyToClipboard(address)
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

  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`
