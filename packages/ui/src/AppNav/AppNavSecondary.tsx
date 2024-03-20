import type { AppNavSecondaryProps } from 'ui/src/AppNav/types'

import React from 'react'
import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils'

import Box from 'ui/src/Box'
import ExternalLink from 'ui/src/Link/ExternalLink'
import HeaderStats from 'ui/src/HeaderStats'
import SelectLocale from 'ui/src/Select/SelectLocale'
import SelectThemes from 'ui/src/Select/SelectThemes'
import Switch from 'ui/src/Switch'

const HeaderSecondary = ({ advancedMode, appsLinks, appStats, locale, theme }: AppNavSecondaryProps) => {
  return (
    <StyledInnerWrapper className="nav-content" grid gridColumnGap={3} flexAlignItems="stretch">
      <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center" flexJustifyContent="left">
        {appStats.map(({ label, value }) => {
          return (
            <HeaderStatsContent key={label}>
              <HeaderStats title={label} valueCached={value} value={value} parsedVal={value} />
            </HeaderStatsContent>
          )
        })}
      </Menu>

      <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center">
        {appsLinks.map(({ id, href, label }, idx) => {
          const isLast = appsLinks.length - 1 === idx
          return (
            <React.Fragment key={id}>
              <ExternalLinkText href={href}>{label}</ExternalLinkText> {!isLast && <Divider>|</Divider>}
            </React.Fragment>
          )
        })}
        {/* THEME */}
        <StyledSelectThemes themeType={theme.themeType} handleThemeChange={theme.handleClick} />
        {/* LOCALE */}
        {typeof locale !== 'undefined' && (
          <SelectLocale
            locales={locale.locales}
            selectedLocale={locale.locale}
            handleLocaleChange={locale.handleChange}
          />
        )}
        {/* ADVANCE MODE */}
        {typeof advancedMode !== 'undefined' && (
          <Switch isSelected={advancedMode.isAdvanceMode} onChange={advancedMode.handleClick}>
            Advanced {advancedMode.isAdvanceMode ? 'on' : 'off'}
          </Switch>
        )}
      </Menu>
    </StyledInnerWrapper>
  )
}

const Divider = styled.p`
  color: var(--page--text-color);
  opacity: 0.3;
`

const StyledSelectThemes = styled(SelectThemes)`
  color: inherit;
  line-height: 1;
  margin-left: var(--spacing-2);

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

const Menu = styled(Box)`
  @media (min-width: ${breakpoints.md}rem) {
    grid-column-gap: ${({ gridColumnGap }) => gridColumnGap ?? 'var(--spacing-3)'};
  }
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
