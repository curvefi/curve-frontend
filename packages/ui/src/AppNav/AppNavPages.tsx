import type { AppPage } from 'ui/src/AppNav/types'

import React from 'react'
import styled from 'styled-components'

import { AppLinkText } from 'ui/src/AppNav/styles'
import Box from 'ui/src/Box'
import DividerHorizontal from 'ui/src/DividerHorizontal'

const AppNavPages = ({ pages }: { pages: AppPage[] }) => {
  return (
    <Box flexAlignItems="center" grid gridAutoFlow="column" gridGap={1}>
      {pages.map(({ route, label, target, isActive, isDivider }) => {
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
      })}
    </Box>
  )
}

const StyledDividerHorizontal = styled(DividerHorizontal)`
  max-height: 16px;
`

const StyledAppLinkText = styled(AppLinkText)`
  min-height: var(--height-medium);
`

export default AppNavPages
