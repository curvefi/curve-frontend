import type { ReactNode } from 'react'

export type FormPlacement = 'inline' | 'mobile-drawer'

export type DetailPageLayoutFormTabs = {
  content: ReactNode
  /**
   * inline: renders the form in the page grid on all breakpoints.
   * mobile-drawer: renders the form in the page grid on tablet/desktop, and in a mobile drawer opened from a fixed action bar.
   */
  placement?: FormPlacement
}
