import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMonitorBotButton } from './LlamaMonitorBotButton'
import { UserPositionsTable, type UserPositionsTableProps } from './UserPositionsTable'

const getMarketCountLabel = (openPositions: number) => (openPositions > 0 ? '◼︎' + openPositions : '')

export const UserPositionsTabs = (props: Omit<UserPositionsTableProps, 'tab' | 'openPositionsByMarketType'>) => {
  // Calculate total positions across all markets (independent of filters)
  const openPositionsCount = useMemo((): Record<MarketRateType, number> => {
    const markets = props.result?.markets ?? []
    return {
      [MarketRateType.Borrow]: markets.filter((market) => market.userHasPositions?.[MarketRateType.Borrow]).length,
      [MarketRateType.Supply]: markets.filter((market) => market.userHasPositions?.[MarketRateType.Supply]).length,
    }
  }, [props.result?.markets])

  // Define tabs with position counts
  const tabs: TabOption<MarketRateType>[] = useMemo(
    () => [
      {
        value: MarketRateType.Borrow,
        label: `${t`Borrowing`} ${getMarketCountLabel(openPositionsCount[MarketRateType.Borrow])}`,
      },
      {
        value: MarketRateType.Supply,
        label: `${t`Lending`} ${getMarketCountLabel(openPositionsCount[MarketRateType.Supply])}`,
      },
    ],
    [openPositionsCount],
  )

  // Show the first tab that has user positions by default, or the first tab if none are found
  const defaultTab = useMemo(() => {
    const userHasPositions = props.result?.userHasPositions
    return tabs.find(({ value }) => userHasPositions?.Lend[value] || userHasPositions?.Mint[value]) ?? tabs[0]
  }, [props.result?.userHasPositions, tabs])

  const [tab, setTab] = useState<MarketRateType>(defaultTab.value)

  return (
    <Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        // needed for the bottom border to be the same height as the tabs
        alignItems="stretch"
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
      >
        <TabsSwitcher value={tab} onChange={setTab} variant="underlined" size="small" options={tabs} />
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="end"
          sx={{ flexGrow: 1, borderBottom: (t) => `1px solid ${t.design.Tabs.UnderLined.Default.Outline}` }}
        >
          <LlamaMonitorBotButton />
        </Stack>
      </Stack>
      {/* the key is needed to force a re-render when the tab changes, otherwise filters have stale state for few milliseconds */}
      <UserPositionsTable key={tab} {...props} tab={tab} />
    </Stack>
  )
}
