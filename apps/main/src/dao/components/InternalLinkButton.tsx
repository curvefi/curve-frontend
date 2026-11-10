import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { InternalLink } from '@legacy-ui/Link'
import { ArrowRightIcon } from '@ui/icons/ArrowRightIcon'

type InternalLinkButtonProps = { to: string; children: ReactNode; smallSize?: boolean }

export const InternalLinkButton = ({ to, children, smallSize }: InternalLinkButtonProps) => (
  <StyledInternalLink size={smallSize ? 'small' : undefined} href={to}>
    {children}
    <ArrowRightIcon sx={{ fontSize: 16 }} />
  </StyledInternalLink>
)

const StyledInternalLink = styled(InternalLink)<{ smallSize?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-size: ${({ smallSize }) => (smallSize ? 'var(--font-size-1)' : 'var(--font-size-2)')};
  padding: ${({ smallSize }) =>
    smallSize ? 'var(--spacing-1) var(--spacing-2)' : 'var(--spacing-2) var(--spacing-4)'};
  font-weight: var(--bold);
  text-decoration: none;
  border: ${({ smallSize }) => (smallSize ? 'none' : '1px solid var(--link--color)')};
  margin-left: auto;
  &:hover {
    cursor: pointer;
    color: var(--button_outlined--hover--color);
    border-color: ${({ smallSize }) => (smallSize ? 'none' : 'var(--button_outlined--hover--color)')};
    background-color: var(--button_outlined--hover--background-color);
  }
`
