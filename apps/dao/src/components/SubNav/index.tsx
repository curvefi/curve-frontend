import { SubNavItem } from './types'

import styled from 'styled-components'

import Box from '@/ui/Box'
import Button from '@/ui/Button'

interface SubNavProps {
  activeKey: string
  navItems: SubNavItem[]
  nested?: boolean
  setNavChange: (key: string) => void
}

const SubNav: React.FC<SubNavProps> = ({ activeKey, navItems, setNavChange, nested }) => {
  return (
    <NavWrapper nested={nested}>
      {navItems.map((item) => (
        <Box key={item.key}>
          <NavButton
            onClick={() => setNavChange(item.key)}
            variant="outlined"
            className={activeKey === item.key ? 'active' : ''}
          >
            {item.label}
          </NavButton>
          {activeKey === item.key && <ActiveIndicator />}
        </Box>
      ))}
    </NavWrapper>
  )
}

const NavWrapper = styled(Box)<{ nested?: boolean }>`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  border-bottom: 1px solid var(--gray-500a20);
  ${({ nested }) => (nested ? '' : `background-color: var(--box_header--secondary--background-color);`)}
`

const NavButton = styled(Button)`
  border: none;
  font-size: var(--font-size-2);
  font-family: var(--font);
  text-transform: none;
  font-weight: var(--bold);
  line-break: break-spaces;
  &:hover {
    background-color: var(--box--secondary--background-color);
  }
`

const ActiveIndicator = styled.div`
  background-color: var(--primary-400);
  width: calc(100%);
  height: 2px;
  transform: translateY(calc(var(--spacing-2) + 1px));
`

export default SubNav
