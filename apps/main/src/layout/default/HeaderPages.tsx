import React from 'react'

import { ROUTE } from '@/constants'

import { AppLinkText } from '@/ui/AppNav'

const HeaderPages = ({
  pages,
  getPath,
}: {
  pages: () => {
    route: string
    label: string
  }[]
  getPath: (route: string) => string
}) => {
  return (
    <>
      {pages().map(({ route, label }) => {
        let isActive = false
        if (location?.pathname) {
          if (route === ROUTE.PAGE_SWAP) {
            isActive = !location.pathname.includes('/pools/') && location.pathname.endsWith(route)
          } else {
            isActive = location.pathname.endsWith(route)
          }
        }

        return (
          <AppLinkText key={route} className={isActive ? 'active' : ''} href={getPath(route)}>
            {label}
          </AppLinkText>
        )
      })}
    </>
  )
}

export default HeaderPages
