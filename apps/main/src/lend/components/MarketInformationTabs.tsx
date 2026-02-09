import { ReactNode, useState } from 'react'
import { Box } from '@mui/material'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'

type Tab = 'borrow' | 'supply'

type MarketInformationTabsProps = {
  currentTab: Tab
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
  const tabs: TabOption<Tab>[] = [
    { value: 'borrow', label: t`Borrow`, href: hrefs.borrow },
    { value: 'supply', label: t`Supply`, href: hrefs.supply },
  ]
  const [tab, setTab] = useState<Tab>(currentTab)

  return (
    <Box>
      {!useLendMarketSubNav() && <TabsSwitcher value={tab} onChange={setTab} variant="contained" options={tabs} />}
      <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>{children}</Box>
    </Box>
  )
}
