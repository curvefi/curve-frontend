import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { t } from '@lingui/macro'

import Stack from '@mui/material/Stack'

import { TabsSwitcher } from 'curve-ui-kit/src/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'

import { LastUpdated } from './LastUpdated'
import { Footer } from './Footer'
import { TabPanel } from './TabPanel'
import { Dex } from './Tabs/Dex'
import { LlamaLend } from './Tabs/LlamaLend'
import { CrvUsd } from './Tabs/CrvUsd'
import { SCrvUsd } from './Tabs/SCrvUsd'

const { MaxWidth } = SizesAndSpaces

const tabs = [
  { id: 'dex', label: t`Dex` },
  { id: 'lend', label: t`LlamaLend` },
  { id: 'crvusd', label: t`crvUSD` },
  { id: 'scrvusd', label: t`Savings crvUSD` },
] as const
type TabId = (typeof tabs)[number]['id']
const DEFAULT_TAB: TabId = 'dex'

type Props = {
  className?: string
}

export const Disclaimer = ({ className }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()

  const getTabFromUrl = () => {
    if (typeof window === 'undefined') return DEFAULT_TAB
    const params = new URLSearchParams(location.search)
    const tabId = params.get('tab')
    return tabs.find((tab) => tab.id === tabId)?.id ?? DEFAULT_TAB
  }

  const handleTabChange = useCallback(
    (newTab: TabId) => {
      setTab(newTab)
      const tabId = tabs.find((tab) => tab.id === newTab)?.id
      if (!tabId) return
      navigate(`${location.pathname}?tab=${tabId}`)
    },
    [navigate, location.pathname],
  )

  const [tab, setTab] = useState(getTabFromUrl())

  // Respond to URL changes and 'back' button.
  useEffect(() => {
    setTab(getTabFromUrl())
  }, [location.search])

  return (
    <Stack
      className={className}
      sx={{
        width: MaxWidth.sm,
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <TabsSwitcher
          variant="contained"
          value={tab}
          onChange={handleTabChange}
          options={tabs.map((tab) => ({ ...tab, value: tab.id }))}
        />
        <LastUpdated />
      </Stack>

      <TabPanel>
        {tab === 'dex' && <Dex />}
        {tab === 'lend' && <LlamaLend />}
        {tab === 'crvusd' && <CrvUsd />}
        {tab === 'scrvusd' && <SCrvUsd />}
        <Footer />
      </TabPanel>
    </Stack>
  )
}
