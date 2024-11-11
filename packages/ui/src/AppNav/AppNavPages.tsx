import type { AppPage } from 'ui/src/AppNav/types'
import { useNavigate } from 'react-router-dom'

import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { Item } from 'react-stately'
import groupBy from 'lodash/groupBy'
import styled from 'styled-components'

import { AppLinkText } from 'ui/src/AppNav/styles'
import Box from 'ui/src/Box'
import Select from 'ui/src/Select'

const Page = ({ route, isActive, target, label }: AppPage) => (
  <React.Fragment key={route}>
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

const PageGroup: FunctionComponent<{ grouped: AppPage[] }> = ({ grouped }) => {
  const [firstPage] = grouped
  const navigate = useNavigate()

  const onSelectionChange = useCallback((route: unknown) => {
    const r = route as string
    navigate(r.charAt(0) === '#' ? r.substring(2) : r)
  }, [navigate])

  if (grouped.length <= 1) {
    return <Page {...firstPage} />
  }

  return (
    <GroupedAppSelect
      items={grouped}
      minWidth={grouped.find((g) => g.minWidth)?.minWidth ?? '9rem'}
      buttonStyles={{ textTransform: 'uppercase', border: 'none' }}
      aria-label={firstPage.groupedTitle}
      noLabelChange
      label=""
      selectedKey={grouped.find((g) => g.isActive)?.route ?? ''}
      onSelectionChange={onSelectionChange}
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
  )
}

const AppNavPages = ({ pages }: { pages: AppPage[];}) => {
  const groupedPages = useMemo(() => Object.values(groupBy(pages, (p) => p.groupedTitle)), [pages])
  return (
    <Box flexAlignItems="center" grid gridAutoFlow="column" gridGap={1}>
      {groupedPages.map((grouped) => <PageGroup key={grouped[0].route} grouped={grouped} />)}
    </Box>
  )
}

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
