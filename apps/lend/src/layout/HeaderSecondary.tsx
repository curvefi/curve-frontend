import { AppNavSecondaryWrapper } from '@/ui/AppNav'
import AppNavSecondary from '@/ui/AppNav/AppNavSecondary'
import type { AppNavSecondaryProps } from '@/ui/AppNav/types'

import { useHeightResizeObserver } from '@/ui/hooks'
import React, { useEffect, useRef } from 'react'

import useStore from '@/store/useStore'


const HeaderSecondary = (props: AppNavSecondaryProps) => {
  const secondaryNavRef = useRef<HTMLDivElement>(null)
  const elHeight = useHeightResizeObserver(secondaryNavRef)

  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)

  useEffect(() => {
    setLayoutHeight('secondaryNav', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  return (
    <AppNavSecondaryWrapper ref={secondaryNavRef} aria-label="Secondary menu">
      <AppNavSecondary {...props} />
    </AppNavSecondaryWrapper>
  )
}

export default HeaderSecondary
