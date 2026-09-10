import type { ReactNode } from 'react'
import type { FormPlacement } from '@ui/features/form-context/types'

export type DetailPageLayoutFormTabs = {
  content: ReactNode
  /**
   * inline: renders the form in the page grid on all breakpoints.
   * mobile-drawer: renders the form in the page grid on tablet/desktop, and in a mobile drawer opened from a fixed action bar.
   */
  placement?: FormPlacement
}
