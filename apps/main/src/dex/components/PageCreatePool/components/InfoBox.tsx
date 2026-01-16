import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { t } from '@ui-kit/lib/i18n'

interface Props {
  link1?: {
    title: string
    link: string
  }
  link2?: {
    title: string
    link: string
  }
}

type StylesProps = {
  link2?: boolean
}

export const InfoBox = ({ link1, link2 }: Props) => (
  <BoxStyles>
    {link1 && (
      <LinkStyles link2 target="_blank" rel="noopener noreferrer" href={link1.link}>
        {t`${link1.title}`}
        <Icon name={'Launch'} size={16} aria-label={t`Link to address`} />
      </LinkStyles>
    )}
    {link2 && (
      <LinkStyles target="_blank" rel="noopener noreferrer" href={link2.link}>
        {t`${link2.title}`}
        <Icon name={'Launch'} size={16} aria-label={t`Link to address`} />
      </LinkStyles>
    )}
  </BoxStyles>
)

const BoxStyles = styled(Box)`
  padding: var(--spacing-3) var(--spacing-4);
  justify-content: center;
  align-content: center;
  display: flex;
  flex-direction: column;
  background: var(--box--primary--background);
  @media (min-width: 36.75rem) {
    flex-direction: row;
  }
`

const LinkStyles = styled.a<StylesProps>`
  background: var(--link_box-alternate--background-color);
  color: var(--page--text-color);
  border: 1px solid var(--nav_button--border-color);
  margin-left: auto;
  margin-right: auto;
  text-decoration: none;
  align-items: center;
  display: flex;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  padding: var(--spacing-narrow) var(--spacing-normal);
  width: 100%;

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  @media (min-width: 36.75rem) {
    margin: auto 0;
    max-width: 18rem;
  }
  &:hover {
    background-color: var(--primary-600l10);
  }
  svg {
    margin-left: auto;
    min-width: 16px;
    min-height: 16px;
    @media (min-width: 36.75rem) {
      margin-left: var(--spacing-3);
    }
  }
  &:nth-of-type(1) {
    margin-bottom: var(--spacing-narrow);
    @media (min-width: 36.75rem) {
      margin-bottom: auto;
      margin-right: ${(props) => (props.link2 ? 'var(--spacing-3)' : '')};
    }
  }
  &:focus-visible {
    outline: var(--button_text--hover--color) auto 2px;
  }
`
