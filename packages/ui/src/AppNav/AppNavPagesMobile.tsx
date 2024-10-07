import type { AppPage } from 'ui/src/AppNav/types'

import React from 'react'
import styled from 'styled-components'

import { AppLinkText } from 'ui/src/AppNav/styles'
import Button from 'ui/src/Button'

const AppNavPagesMobile = ({ appPage, handleClick }: { appPage: AppPage; handleClick(): void }) => {
  const { route, label, target, isActive } = appPage

  return route.startsWith('http') ? (
    <AppLinkText
      key={route}
      className={isActive ? 'active' : ''}
      {...(target === '_blank' ? { target, rel: 'noreferrer noopener' } : {})}
      href={route}
    >
      {label}
    </AppLinkText>
  ) : (
    <MobileButton key={route} onClick={handleClick}>
      {label}
    </MobileButton>
  )
}

const MobileButton = styled(Button).attrs(() => ({
  size: 'medium',
  variant: 'text',
}))`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 1.125rem;
`

export default AppNavPagesMobile
