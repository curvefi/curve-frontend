import styled from 'styled-components'

import IconButton from 'ui/src/IconButton'
import Tabs, { Tab } from 'ui/src/Tab'
import { breakpoints } from 'ui/src/utils'
import SandwichMenu from './ui/SandwichMenu'

const AppFormHeader = ({
  formTypes,
  activeFormKey,
  handleClick,
  showMenuButton = false,
}: {
  formTypes: { key: string; label: string }[]
  activeFormKey: string
  handleClick(formKey: string): void
  showMenuButton?: boolean
}) => {
  return (
    <Header>
      {formTypes.length === 1 ? (
        <>
          <IconButton hidden />
          <HeaderTitle>{formTypes[0].label}</HeaderTitle>
        </>
      ) : (
        <Tabs>
          <>
            {formTypes.map(({ key, label }) => {
              const isActiveForm = !activeFormKey && key === activeFormKey
              return (
                <StyledTab
                  key={key}
                  className={isActiveForm ? 'active' : activeFormKey === key ? 'active' : ''}
                  disabled={isActiveForm || activeFormKey === key}
                  onClick={() => handleClick(key)}
                >
                  {label}
                </StyledTab>
              )
            })}
            {showMenuButton && <SandwichMenu onItemClick={handleClick} />}
          </>
        </Tabs>
      )}
      {formTypes.length === 1 && <IconButton hidden />}
    </Header>
  )
}

const Header = styled.header`
  display: flex;
  justify-content: space-between;

  background-color: var(--box_header--primary--background-color);
  border-bottom: var(--box_header--border);
`

const HeaderTitle = styled.h3`
  align-items: center;
  display: flex;
  font-size: var(--button--font-size);
  font-family: var(--button--font);
  font-weight: var(--button--font-weight);
`

const StyledTab = styled(Tab)`
  font-size: var(--button--font-size);
  padding-left: var(--spacing-2);
  padding-right: var(--spacing-2);

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: var(--spacing-3);
    padding-right: var(--spacing-3);
  }
`

export default AppFormHeader
