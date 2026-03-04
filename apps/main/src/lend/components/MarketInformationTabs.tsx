import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'

type MarketInformationTabsProps = {
  currentTab: 'borrow' | 'supply'
  hrefs: {
    borrow: string
    supply: string
  }
  children: ReactNode
}

/**
 * Used in Lend markets to compose with PositionDetails if there is a user position (borrow or supply)
 * for this market or with MarketDetails if there is no user position.
 *
 * Kept as a layout wrapper to preserve spacing/composition at the callsites.
 */
export const MarketInformationTabs = ({ children }: MarketInformationTabsProps) => <Stack>{children}</Stack>
