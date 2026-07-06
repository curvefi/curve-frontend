import type { ReactNode } from 'react'

export type FormPlacement = 'inline' | 'mobile-drawer'

export type DetailPageLayoutFormTabs = {
  content: ReactNode
  placement?: FormPlacement
}
