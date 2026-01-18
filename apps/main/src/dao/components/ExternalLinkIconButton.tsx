import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link'
import { TooltipButton } from '@ui/Tooltip/TooltipButton'

type ExternalLinkIconButtonProps = {
  href?: string
  tooltip: string
  children?: ReactNode
}

/** Returns null when href is undefined, allowing concise usage without conditional checks at call sites. */
export const ExternalLinkIconButton = ({ href, tooltip, children }: ExternalLinkIconButtonProps) =>
  href && (
    <TooltipButton
      clickable
      noWrap
      tooltip={tooltip}
      customIcon={
        <StyledExternalLink href={href}>
          {children}
          <Icon name="Launch" size={16} />
        </StyledExternalLink>
      }
    />
  )

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: end;
  gap: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  text-decoration: none;
  &:hover {
    cursor: pointer;
  }
`
