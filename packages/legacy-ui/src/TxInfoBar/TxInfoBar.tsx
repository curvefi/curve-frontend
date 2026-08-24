import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { Box } from '@legacy-ui/Box'
import { Icon } from '@legacy-ui/Icon'
import { IconButton } from '@legacy-ui/IconButton'
import { RCExternal } from '@legacy-ui/images'
import { ExternalLink } from '@legacy-ui/Link'
import { toArray } from '@primitives/array.utils'

type Props = {
  description: ReactNode
  txHash: string | string[] | undefined
  onClose?: () => void
}

export const TxInfoBar = ({ description, txHash, onClose }: Props) => (
  <StyledInfoBar grid gridTemplateColumns="1fr auto" gridColumnGap="3" flexAlignItems="center" fillWidth>
    <InfoTitle>
      {description}{' '}
      {toArray(txHash).map(tx => (
        <StyledExternalLink href={tx} key={tx}>
          <RCExternal />
        </StyledExternalLink>
      ))}
    </InfoTitle>
    {typeof onClose === 'function' && (
      <StyledIconButton onClick={onClose}>
        <Icon name="Close" size={24} aria-label="close icon" />
      </StyledIconButton>
    )}
  </StyledInfoBar>
)

const StyledIconButton = styled(IconButton)`
  min-height: auto;
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  margin-left: var(--spacing-1);
`

const StyledInfoBar = styled(Box)`
  padding: var(--spacing-2);
  padding-right: 0;

  color: var(--white);
  background-color: var(--info-400);

  a {
    color: inherit;
  }
`

const InfoTitle = styled.span`
  font-weight: var(--font-weight--bold);
  word-break: break-word;
`
