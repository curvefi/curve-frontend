import type { Locale } from '@/lib/i18n'

import { Item } from 'react-stately'
import { useLocation, useNavigate } from 'react-router-dom'
import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { DEFAULT_LOCALES, findLocale } from '@/lib/i18n'
import { isDevelopment } from '@/utils'
import { useSetLocale } from 'onboard-helpers'
import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import Select from '@/ui/Select'

type Props = {
  className?: string
  mobileHeader?: {
    showList: boolean
    setShowList: React.Dispatch<React.SetStateAction<boolean>>
  }
}

export const SelectLocale = ({ mobileHeader, ...props }: React.PropsWithChildren<Props>) => {
  const location = useLocation()
  const navigate = useNavigate()
  const updateWalletLocale = useSetLocale()

  const locale = useStore((state) => state.locale)

  const [locales, setLocales] = useState<Locale[]>(DEFAULT_LOCALES)

  const localDisplayName = useMemo(() => {
    const foundLocale = locales.find((l) => l.value.toLowerCase() === locale.toLowerCase())
    return foundLocale?.name
  }, [locale, locales])

  const handleLocaleChange = (selectedLocale: string, pathname?: string) => {
    if (pathname) {
      const foundLocale = findLocale(selectedLocale)
      const foundMatchLocale = DEFAULT_LOCALES.find((l) => pathname.startsWith(`/${l.value}/`))
      let redirectPathname

      if (foundLocale) {
        updateWalletLocale(foundLocale.value)
        if (selectedLocale === 'en') {
          if (foundMatchLocale) {
            redirectPathname = pathname.replace(`/${foundMatchLocale.value}`, '')
          }
        } else if (foundMatchLocale) {
          redirectPathname = pathname.replace(`/${foundMatchLocale.value}`, `/${selectedLocale}`)
        } else {
          redirectPathname = `/${selectedLocale}${pathname}`
        }
      }

      if (redirectPathname) {
        navigate(redirectPathname)
      }
    }
  }

  useEffect(() => {
    if (isDevelopment) {
      setLocales(DEFAULT_LOCALES)
    } else {
      const updatedLocales = DEFAULT_LOCALES.filter((l) => l.name !== 'pseudo')
      setLocales(updatedLocales)
    }
  }, [])

  return mobileHeader ? (
    <>
      <MobileButton size="medium" variant="text" fillWidth onClick={() => mobileHeader.setShowList((prev) => !prev)}>
        {localDisplayName}{' '}
        {mobileHeader.showList ? (
          <Icon name="CaretUp" size={16} aria-label="hide icon" />
        ) : (
          <Icon name="CaretDown" size={16} aria-label="show icon" />
        )}
      </MobileButton>
      <LocaleList className={`collapsed ${mobileHeader.showList ? 'show' : ''}`}>
        {locales.map((l) => {
          return l.value === locale ? null : (
            <li key={l.value} onClick={() => handleLocaleChange(l.value, location?.pathname)}>
              {l.name}
            </li>
          )
        })}
      </LocaleList>
    </>
  ) : (
    <StyledSelect
      {...props}
      aria-label="Locale"
      minWidth="88px"
      label=""
      items={locales}
      selectedKey={locale}
      onSelectionChange={(locale) => handleLocaleChange(locale as string, location?.pathname)}
    >
      {(item) => {
        const { value, name } = item as Locale
        return (
          <Item key={value} textValue={value}>
            {name}
          </Item>
        )
      }}
    </StyledSelect>
  )
}

SelectLocale.defaultProps = {
  className: '',
}

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
