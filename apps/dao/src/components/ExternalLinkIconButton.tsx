import styled from 'styled-components'

import TooltipButton from '@/ui/Tooltip'
import { ExternalLink } from '@/ui/Link'
import Icon from '@/ui/Icon'

type ExternalLinkIconButtonProps = {
  href: string
  tooltip: string
}

const ExternalLinkIconButton = ({ href, tooltip }: ExternalLinkIconButtonProps) => {
  return (
    <TooltipButton
      noWrap
      tooltip={tooltip}
      customIcon={
        <StyledExternalLink href={href}>
          <Icon name="Launch" size={16} />
        </StyledExternalLink>
      }
    />
  )
}

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: end;
  gap: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  text-transform: none;
  text-decoration: none;
  &:hover {
    cursor: pointer;
  }
`

export default ExternalLinkIconButton
