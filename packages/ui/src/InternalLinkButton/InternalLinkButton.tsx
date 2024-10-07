import styled from 'styled-components'
import Button from 'ui/src/Button'
import { ReactComponent as ExternalIcon } from 'ui/src/images/external.svg'


type Props = {
  title: string
  onClick: () => void
}

const InternalLinkButton = ({ title, onClick }: Props) => (
  <StyledButton onClick={onClick}>
    {title}
    <StyledExternalIcon />
  </StyledButton>
)

const StyledButton = styled(Button)`
  background: var(--nav_link--active--hover--background-color);
  color: var(--box--primary--color);
  text-decoration: none;
  align-items: center;
  display: flex;
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  padding: var(--spacing-narrow) var(--spacing-normal);
  justify-content: center;

  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  &:hover {
    background: var(--primary-400);
    color: var(--white);
    cursor: pointer;
  }
  :focus-visible {
    outline: var(--button_text--hover--color) auto 2px;
  }
`

const StyledExternalIcon = styled(ExternalIcon)`
  margin: auto 0;
  margin-left: var(--spacing-2);
`

export default InternalLinkButton
