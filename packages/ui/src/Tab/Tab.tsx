import styled from 'styled-components'

type TabProps = {
  testId?: string
  variant?: 'secondary'
}

const Tab = styled.button.attrs((props: TabProps) => ({ 'data-testid': `tab-${props.testId}` }))<TabProps>`
  background-color: transparent;
  box-shadow: none;
  color: ${({ variant }) => (variant === 'secondary' ? `var(--tab_secondary--color);` : `var(--tab--color);`)}
  font-size: var(--font-size-2);
  font-family: var(--button--font);
  font-weight: var(--button--font-weight);
  min-height: var(--height-large);
  padding: 0 1rem;
  position: relative;
  transition: none;
  
  &:not(:disabled) {
    cursor: pointer;
  }
  
  :hover {
    background-color: var(--tab--content--background-color);
  }
  
  &.active {
    color: ${({ variant }) => (variant === 'secondary' ? `var(--tab-secondary--active--color);` : `inherit;`)}
    background-color: ${({ variant }) =>
      variant === 'secondary' ? `var(--tab-secondary--background-color);` : `var(--tab--content--background-color);`}
    position: relative;

    &:not(:disabled) {
      transform: none;
    }

    ::before {
      background-color: ${({ variant }) =>
        variant === 'secondary' ? `var(--tab-secondary--background-color);` : `var(--tab--content--background-color);`}
      content: '';
      position: absolute;
      width: 100%;
      height: 3px;
      bottom: -3px; //to place it in bottom
      left: 0;
      z-index: var(--z-index-tab);
    }
  }
`

export default Tab
