import { Item } from 'react-stately'
import React, { useCallback } from 'react'
import styled from 'styled-components'

import Button from 'ui/src/Button'
import Icon from 'ui/src/Icon'
import Select from 'ui/src/Select/Select'

export const SelectLocale = ({
  className,
  locales,
  selectedLocale,
  mobileHeader,
  handleLocaleChange,
}: React.PropsWithChildren<{
  className?: string
  locales: { value: string; name: string; lang: string }[]
  selectedLocale: string
  mobileHeader?: {
    showList: boolean
    setShowList: React.Dispatch<React.SetStateAction<boolean>>
  }
  handleLocaleChange(selectedLocale: React.Key): void
}>) => {
  const getDisplayName = useCallback(
    (selectedLocale: string) => {
      if (!selectedLocale) return ''
      return locales.find(({ value }) => value.toLowerCase() === selectedLocale.toLowerCase())?.name ?? ''
    },
    [locales],
  )

  return mobileHeader ? (
    <>
      <MobileButton size="medium" variant="text" fillWidth onClick={() => mobileHeader.setShowList((prev) => !prev)}>
        {getDisplayName(selectedLocale)}{' '}
        {mobileHeader.showList ? (
          <Icon name="CaretUp" size={16} aria-label="hide icon" />
        ) : (
          <Icon name="CaretDown" size={16} aria-label="show icon" />
        )}
      </MobileButton>
      <LocaleList className={`collapsed ${mobileHeader.showList ? 'show' : ''}`}>
        {locales.map((l) => {
          return l.value === selectedLocale ? null : (
            <li key={l.value} onClick={() => handleLocaleChange(l.value)}>
              {l.name}
            </li>
          )
        })}
      </LocaleList>
    </>
  ) : (
    <StyledSelect
      className={className}
      aria-label="Select locale"
      minWidth="88px"
      label=""
      items={locales}
      selectedKey={selectedLocale}
      onSelectionChange={handleLocaleChange}
    >
      {(item) => {
        const i = item as { value: string; name: string }
        return (
          <Item key={i.value} textValue={i.value}>
            {i.name}
          </Item>
        )
      }}
    </StyledSelect>
  )
}

SelectLocale.displayName = 'SelectLocale'
const MobileButton = styled(Button)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 1.125rem;
`

const LocaleList = styled.ul``

const StyledSelect = styled(Select)`
  && {
    border: none;
    height: 2.25rem; // 36px;
    width: 100%;
  }
`

export default SelectLocale
