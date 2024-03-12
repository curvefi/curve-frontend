import styled from 'styled-components'

import IconButton from '@/ui/IconButton'
import Tabs, { Tab } from '@/ui/Tab'

const FormHeader = ({
  formTypes,
  activeFormKey,
  handleClick,
}: {
  formTypes: { key: string; label: string }[]
  activeFormKey: string
  handleClick: (formKey: string) => void
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
          {formTypes.map(({ key, label }) => {
            const isActiveForm = !activeFormKey && key === activeFormKey
            return (
              <Tab
                key={key}
                className={isActiveForm ? 'active' : activeFormKey === key ? 'active' : ''}
                disabled={isActiveForm || activeFormKey === key}
                onClick={() => handleClick(key)}
              >
                {label}
              </Tab>
            )
          })}
        </Tabs>
      )}
      <IconButton hidden />
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

export default FormHeader
