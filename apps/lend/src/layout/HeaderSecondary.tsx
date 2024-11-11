import type { AppNavSecondaryProps } from '@/ui/AppNav/types'

import React from 'react'

import { AppNavSecondaryWrapper } from '@/ui/AppNav'
import AppNavSecondary from '@/ui/AppNav/AppNavSecondary'

const HeaderSecondary = (props: AppNavSecondaryProps) => (
  <AppNavSecondaryWrapper aria-label="Secondary menu">
    <AppNavSecondary {...props} />
  </AppNavSecondaryWrapper>
)

export default HeaderSecondary
