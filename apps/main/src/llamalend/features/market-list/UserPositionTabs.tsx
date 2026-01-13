import { useEffect, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { fromEntries } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMonitorBotButton } from './LlamaMonitorBotButton'
import { UserPositionSummary } from './UserPositionsSummary'
import { UserPositionsTable, type UserPositionsTableProps } from './UserPositionsTable'

const { Spacing, Height } = SizesAndSpaces

export const UserPositionsTabs = (props: Omit<UserPositionsTableProps, 'tab' | 'openPositionsByMarketType'>) => {
  const { connect } = useWallet()
  const { address } = useConnection()
  const { markets } = props.result ?? {}

  // Calculate total positions number across all markets (independent of filters)
  const openPositionsCount = useMemo(
    (): Record<MarketRateType, string | undefined> =>
      fromEntries(
        Object.values(MarketRateType).map((type) => [
          type,
          markets && `${markets.filter((market) => market.userHasPositions?.[type]).length}`,
        ]),
      ),
    [markets],
  )

  // Define tabs with position counts
  const tabs: TabOption<MarketRateType>[] = useMemo(
    () => [
      {
        value: MarketRateType.Borrow,
        label: t`Borrowing`,
        endAdornment: openPositionsCount[MarketRateType.Borrow],
      },
      {
        value: MarketRateType.Supply,
        label: t`Lending`,
        endAdornment: openPositionsCount[MarketRateType.Supply],
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

  // Update tab when defaultTab changes (e.g., when user positions data loads)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab(defaultTab.value)
  }, [defaultTab.value])

  return (
    <Stack>
      <Stack
        direction="row"
        alignItems="end"
        sx={{
          minHeight: Height.userPositionsTitle,
          paddingBlockEnd: Spacing.sm,
          paddingInline: Spacing.md,
          flexGrow: 1,
          borderBottom: (t) => `1px solid ${t.design.Tabs.UnderLined.Default.Outline}`,
          backgroundColor: (t) => t.design.Layer[1].Fill,
        }}
      >
        <Typography variant="headingXsBold">Your Positions</Typography>
      </Stack>
      {address ? (
        <>
          <UserPositionSummary markets={markets} tab={tab} />
          <Stack
            direction="row"
            justifyContent="space-between"
            // needed for the bottom border to be the same height as the tabs
            alignItems="stretch"
            sx={{
              backgroundColor: (t) => t.design.Layer[1].Fill,
            }}
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
        </>
      ) : (
        <Stack
          paddingBlock={Spacing.md}
          alignItems="center"
          width="100%"
          sx={{
            backgroundColor: (t) => t.design.Layer[1].Fill,
          }}
        >
          <EmptyStateCard
            action={
              <Button size="medium" onClick={() => connect()}>
                {t`Connect to view positions`}
              </Button>
            }
          />
        </Stack>
      )}
    </Stack>
  )
}
