import { t } from '@lingui/macro'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { useHeightResizeObserver } from '@/ui/hooks'
import useStore from '@/store/useStore'

import { DEFAULT_LOCALES } from '@/lib/i18n'
import { Menu } from '@/layout/Header'
import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import SelectLocale from '@/ui/Select/SelectLocale'
import SelectThemes from '@/ui/Select/SelectThemes'

const HeaderSecondary = ({ handleLocaleChange }: { handleLocaleChange(selectedLocale: string): void }) => {
  const secondaryNavRef = useRef<HTMLDivElement>(null)
  const secondaryNavHeight = useHeightResizeObserver(secondaryNavRef)

  const locale = useStore((state) => state.locale)
  const themeType = useStore((state) => state.themeType)
  const setThemeType = useStore((state) => state.setThemeType)
  const updateLayoutHeight = useStore((state) => state.updateLayoutHeight)

  useEffect(() => {
    updateLayoutHeight('secondaryNav', secondaryNavHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondaryNavHeight])

  return (
    <Wrapper ref={secondaryNavRef} aria-label="Secondary menu">
      <SecondaryNav className="nav-content" grid gridColumnGap={3} flexAlignItems="stretch">
        <Menu
          grid
          gridAutoFlow="column"
          gridColumnGap="var(--spacing-2)"
          flexAlignItems="center"
          flexJustifyContent="left"
        ></Menu>

        <Menu grid gridAutoFlow="column" gridColumnGap="var(--spacing-1)" flexAlignItems="center">
          <ExternalLinkText href="https://curve.fi">Curve.fi</ExternalLinkText> <Divider>|</Divider>
          <ExternalLinkText href="https://crvusd-curve.fi">CrvUSD</ExternalLinkText> <Divider>|</Divider>
          <ExternalLinkText href="https://gov.curve.fi/">{t`Governance`}</ExternalLinkText> <Divider>|</Divider>
          <StyledSelectThemes themeType={themeType} setThemeType={setThemeType} />
          {process.env.NODE_ENV === 'development' && (
            <>
              <Divider>|</Divider>
              <StyledSelectLocale
                locales={DEFAULT_LOCALES}
                selectedLocale={locale}
                handleLocaleChange={handleLocaleChange}
              />
            </>
          )}
        </Menu>
      </SecondaryNav>
    </Wrapper>
  )
}

const StyledSelectLocale = styled(SelectLocale)`
  button {
    border: none;
  }
`

const StyledSelectThemes = styled(SelectThemes)`
  color: inherit;
  line-height: 1;
  :hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`

const Divider = styled.p`
  color: var(--page--text-color);
  opacity: 0.3;
`

const ExternalLinkText = styled(ExternalLink)`
  text-decoration: none;
  text-transform: initial;
  margin: 0 var(--spacing-2);
  color: inherit;
`

const SecondaryNav = styled(Box)`
  height: var(--top-nav-height);
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-normal);
  width: 100%;
  grid-template-columns: 1fr auto;
`

const Wrapper = styled.nav`
  border-bottom: 1px solid var(--nav--border-color);
  font-size: var(--font-size-2);
  font-weight: bold;
  //position: sticky;
  top: 0;
  color: var(--nav--color);
  background-color: var(--page--background-color);
  z-index: var(--z-index-page--top-nav);
`

export default HeaderSecondary
