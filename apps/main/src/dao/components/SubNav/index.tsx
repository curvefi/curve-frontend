import { styled } from 'styled-components'
import Box from '@ui/Box'
import Button from '@ui/Button'
import { SubNavItem } from './types'

interface SubNavProps {
  activeKey: string
  navItems: SubNavItem[]
  nested?: boolean
  className?: string
  setNavChange: (key: string) => void
}

const SubNav = ({ activeKey, navItems, setNavChange, nested, className }: SubNavProps) => (
  <NavWrapper nested={nested} className={className}>
    {navItems.map((item) => (
      <ButtonWrapper key={item.key}>
        <NavButton
          onClick={() => setNavChange(item.key)}
          variant="outlined"
          className={activeKey === item.key ? 'active' : ''}
        >
          {item.label}
        </NavButton>
      </ButtonWrapper>
    ))}
  </NavWrapper>
)

const NavWrapper = styled(Box)<{ nested?: boolean }>`
  display: flex;
  flex-direction: row;
`

const ButtonWrapper = styled(Box)`
  background-color: var(--box_header--primary--background-color);
  color: var(--tab--color);
`

const NavButton = styled(Button)`
  border: none;
  font-size: var(--font-size-2);
  font-family: var(--font);
  text-transform: none;
  font-weight: var(--bold);
  line-break: break-spaces;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  background-color: var(--box--secondary--content--background-color);
  &.active {
    border-top: 2px solid var(--primary-400);
    padding-top: calc(var(--spacing-3) - 2px);
    background-color: var(--box--secondary--background-color);
  }
  &:hover:not(:disabled) {
    background-color: var(--box--secondary--background-color);
  }
`

export default SubNav
