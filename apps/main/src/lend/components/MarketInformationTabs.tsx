import { type ReactNode, useState } from 'react'
import Stack from '@mui/material/Stack'
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
 *
 * This is only kept in the "stable" path for now but needed to wrap the legacy TabsSwitcher with children to avoid higher order CSS gap, due for deletion.
 */
export const MarketInformationTabs = ({ currentTab, hrefs, children }: MarketInformationTabsProps) => {
  const tabs: TabOption<Tab>[] = [
    { value: 'borrow', label: t`Borrow`, href: hrefs.borrow },
    { value: 'supply', label: t`Supply`, href: hrefs.supply },
  ]
  const [tab, setTab] = useState<Tab>(currentTab)
  const showSubNav = useLendMarketSubNav()
  return (
    <Stack>
      {!showSubNav && <TabsSwitcher value={tab} onChange={setTab} variant="contained" options={tabs} />}
      {children}
    </Stack>
  )
}
