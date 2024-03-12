import { t } from '@lingui/macro'
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { DEFAULT_LOCALES } from '@/lib/i18n'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Menu } from '@/layout/Header'
import Box from '@/ui/Box'
import ExternalLink from '@/ui/Link/ExternalLink'
import SelectLocale from '@/ui/Select/SelectLocale'
import SelectThemes from '@/components/SelectThemes'
import Switch from '@/ui/Switch'
import { useHeightResizeObserver } from '@/ui/hooks'
import DividerHorizontal from '@/ui/DividerHorizontal'

const HeaderSecondary = ({ handleLocaleChange }: { handleLocaleChange: (selectedLocale: React.Key) => void }) => {
  const secondaryNavRef = useRef<HTMLDivElement>(null)
  const elHeight = useHeightResizeObserver(secondaryNavRef)

  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const locale = useStore((state) => state.locale)
  const scrollY = useStore((state) => state.layout.scrollY)
  const setAppCache = useStore((state) => state.setAppCache)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)

  const handleInpChangeAdvanceMode = () => {
    setAppCache('isAdvanceMode', !isAdvanceMode)
  }

  useEffect(() => {
    setLayoutHeight('secondaryNav', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  return (
    <Wrapper scrollY={scrollY} ref={secondaryNavRef} aria-label="Secondary menu">
      <StyledInnerWrapper className="nav-content" grid gridColumnGap={3} flexAlignItems="stretch">
        <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center" flexJustifyContent="left"></Menu>

        <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center">
          Visit <ExternalLinkText href="https://curve.fi">Curve.fi</ExternalLinkText>
          <StyledSelectThemes />
          {/* TODO: remove isDevelopment when translation is ready */}
          {process.env.NODE_ENV === 'development' && (
            <SelectLocale locales={DEFAULT_LOCALES} selectedLocale={locale} handleLocaleChange={handleLocaleChange} />
          )}
          <Switch isSelected={isAdvanceMode} onChange={handleInpChangeAdvanceMode}>
            Advanced mode {isAdvanceMode ? t`on` : t`off`}
          </Switch>
        </Menu>
      </StyledInnerWrapper>
    </Wrapper>
  )
}

const StyledSelectThemes = styled(SelectThemes)`
  color: inherit;
  line-height: 1;

  :hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`

const ExternalLinkText = styled(ExternalLink)`
  text-decoration: none;
  text-transform: initial;

  color: inherit;
`

const StyledInnerWrapper = styled(Box)`
  height: var(--top-nav-height);
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-normal);
  width: 100%;

  grid-template-columns: 1fr auto;
`

const Wrapper = styled.nav<{ scrollY: number | null }>`
  border-bottom: 1px solid var(--nav--border-color);
  font-size: var(--font-size-2);
  font-weight: bold;
  //position: sticky;
  top: 0;

  color: var(--nav--color);
  background-color: var(--page--background-color);
  z-index: var(--z-index-page--top-nav);
`

const HeaderStatsContent = styled.span`
  max-width: 15.625rem; //250px
  margin: 0 var(--spacing-2);
  :first-child {
    margin-left: 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    max-width: 18.75rem; //300px
  }
`

export default HeaderSecondary
