import type { AppNavSecondaryProps } from '@/ui/AppNav/types'

import { useRef } from 'react'

import useLayoutHeight from '@/hooks/useLayoutHeight'

import { AppNavSecondaryWrapper } from '@/ui/AppNav'
import AppNavSecondary from '@/ui/AppNav/AppNavSecondary'

const HeaderSecondary = (props: AppNavSecondaryProps) => {
  const secondaryNavRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(secondaryNavRef, 'secondaryNav')

  return (
    <AppNavSecondaryWrapper ref={secondaryNavRef} aria-label="Secondary menu">
      <AppNavSecondary {...props} />
    </AppNavSecondaryWrapper>
  )
}

export default HeaderSecondary
