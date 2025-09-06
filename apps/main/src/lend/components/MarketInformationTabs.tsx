import { ReactNode, useState } from 'react'
import { Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

type TabValue = 'borrow' | 'supply'

type MarketInformationTabsProps = {
  currentTab: TabValue
  hrefs: {
    borrow: string
    supply: string
  }
  children: ReactNode
}

/**
 * Used in Lend markets to compose with PositionDetails if there is a user position (borrow or supply)
 * for this market or with MarketDetails if there is no user position.
 */
export const MarketInformationTabs = ({ currentTab, hrefs, children }: MarketInformationTabsProps) => {
  const TABS: { value: TabValue; label: string; href: string }[] = [
    { value: 'borrow', label: t`Borrow`, href: hrefs.borrow },
    { value: 'supply', label: t`Supply`, href: hrefs.supply },
  ]
  const [tab, setTab] = useState<TabValue>(currentTab)

  return (
    <Box>
      <TabsSwitcher value={tab} onChange={setTab} variant="contained" size="medium" options={TABS} />
      <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>{children}</Box>
    </Box>
  )
}
