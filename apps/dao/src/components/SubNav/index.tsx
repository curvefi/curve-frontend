import { SubNavItem } from './types'

import styled from 'styled-components'

import Box from '@/ui/Box'
import Button from '@/ui/Button'

interface SubNavProps {
  activeKey: string
  navItems: SubNavItem[]
  nested?: boolean
  className?: string
  setNavChange: (key: string) => void
}

const SubNav: React.FC<SubNavProps> = ({ activeKey, navItems, setNavChange, nested, className }) => {
  return (
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
}

const NavWrapper = styled(Box)<{ nested?: boolean }>`
  display: flex;
  flex-direction: row;
`

const ButtonWrapper = styled(Box)`
  background-color: var(--page--background-color);
`

const NavButton = styled(Button)`
  border: none;
  font-size: var(--font-size-2);
  font-family: var(--font);
  text-transform: none;
  font-weight: var(--bold);
  line-break: break-spaces;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  background-color: var(--box_header--secondary--background-color);
  &.active {
    border-top: 2px solid var(--primary-400);
    padding-top: calc(var(--spacing-3) - 2px);
    background-color: var(--box--secondary--background-color);
  }
`

export default SubNav
