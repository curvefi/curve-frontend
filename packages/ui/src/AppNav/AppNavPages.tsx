import groupBy from 'lodash/groupBy'
import React from 'react'
import type { NavigateFunction } from 'react-router-dom'

import { Item } from 'react-stately'
import styled from 'styled-components'

import { AppLinkText } from 'ui/src/AppNav/styles'
import type { AppPage } from 'ui/src/AppNav/types'
import Box from 'ui/src/Box'
import DividerHorizontal from 'ui/src/DividerHorizontal'
import Select from 'ui/src/Select'

const Page = ({ route, isActive, isDivider, target, label }: AppPage) => {
  return (
    <React.Fragment key={route}>
      {isDivider && <StyledDividerHorizontal />}
      <StyledAppLinkText
        key={route}
        className={isActive ? 'active' : ''}
        {...(target === '_blank' ? { target, rel: 'noreferrer noopener' } : {})}
        href={route}
      >
        {label}
      </StyledAppLinkText>
    </React.Fragment>
  )
}

const AppNavPages = ({ pages, navigate }: { pages: AppPage[]; navigate: NavigateFunction }) => {
  const groupedPages = Object.values(groupBy(pages, (p) => p.groupedTitle))

  return (
    <Box flexAlignItems="center" grid gridAutoFlow="column" gridGap={1}>
      {groupedPages.length !== pages.length
        ? groupedPages.map((grouped) => {
            const firstPage = grouped[0]
            const selectedKey = grouped.find((g) => g.isActive)?.route ?? ''
            const minWidth = grouped.find((g) => g.minWidth)?.minWidth ?? '9rem'

            return grouped.length > 1 ? (
              <GroupedAppSelect
                key={firstPage.label}
                items={grouped}
                minWidth={minWidth}
                buttonStyles={{ textTransform: 'uppercase', border: 'none' }}
                aria-label={firstPage.groupedTitle}
                noLabelChange
                label=""
                selectedKey={selectedKey}
                onSelectionChange={(route) => {
                  const r = route as string
                  let parsedRoute = r.charAt(0) === '#' ? r.substring(2) : r
                  navigate(parsedRoute)
                }}
              >
                {(item) => {
                  const { label, isActive, route, target } = item as AppPage
                  return (
                    <Item key={route} textValue={route}>
                      <GroupedAppLinkText
                        key={route}
                        className={isActive ? 'active' : ''}
                        {...(target === '_blank' ? { target, rel: 'noreferrer noopener' } : {})}
                        href={route}
                      >
                        {label}
                      </GroupedAppLinkText>
                    </Item>
                  )
                }}
              </GroupedAppSelect>
            ) : (
              <Page key={firstPage.route} {...firstPage} />
            )
          })
        : pages.map((page) => <Page key={page.route} {...page} />)}
    </Box>
  )
}

const StyledDividerHorizontal = styled(DividerHorizontal)`
  max-height: 16px;
`

const StyledAppLinkText = styled(AppLinkText)`
  min-height: var(--height-medium);
`

const GroupedAppLinkText = styled(AppLinkText)`
  padding: var(--spacing-2);
  margin: 0;
  width: 100%;
`

const GroupedAppSelect = styled(Select)`
  && {
    border: none;

    li {
      padding: 0;
    }
  }
`

export default AppNavPages
