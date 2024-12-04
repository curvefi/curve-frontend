import styled from 'styled-components'

import { ReactComponent as ExternalIcon } from '@/images/external.svg'
import ExternalLink from '@/ui/Link/ExternalLink'

type Props = {
  description: string
  link: string
  theme?: 'plain'
  className?: string
}

type StylesProps = {
  theme?: 'plain'
}

const InfoLinkBar = ({ description, link, theme, className }: Props) => {
  return (
    <StyledExternalLink className={className} theme={theme} href={link}>
      <InfoDescription>{description}</InfoDescription>
      <StyledExternalIcon />
    </StyledExternalLink>
  )
}

const StyledExternalIcon = styled(ExternalIcon)`
  margin: auto 0;
  margin-left: var(--spacing-2);
  min-width: 24px;
`

const StyledExternalLink = styled(ExternalLink)<StylesProps>`
  width: 100%;
  padding: var(--spacing-2);
  padding-right: 0;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  display: flex;
  flex-direction: row;
  align-content: center;
  text-decoration: none;
  margin-top: var(--spacing-2);

  color: ${(props) => (props.theme === 'plain' ? 'var(--box--primary--color)' : 'var(--white)')};
  background-color: ${(props) => (props.theme === 'plain' ? 'var(--primary-400a10)' : 'var(--info-400)')};
`

const InfoDescription = styled.span`
  font-weight: var(--font-weight--bold);
  padding-left: var(--spacing-2);
  margin: auto auto auto 0;
  text-transform: none;
`

export default InfoLinkBar
