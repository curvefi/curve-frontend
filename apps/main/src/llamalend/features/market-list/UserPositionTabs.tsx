import { useMemo, useState } from 'react'
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
import { UserPositionsTable, type UserPositionsTableProps } from './UserPositionsTable'

const { Height, Spacing } = SizesAndSpaces

export const UserPositionsTabs = (props: Omit<UserPositionsTableProps, 'tab' | 'openPositionsByMarketType'>) => {
  const { provider, connect } = useWallet()
  // Calculate total positions across all markets (independent of filters)
  const { markets } = props.result ?? {}
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

  return (
    <Stack
      sx={{
        backgroundColor: (t) => t.design.Layer[1].Fill,
      }}
    >
      <Stack
        direction="row"
        alignItems="end"
        sx={{
          minHeight: Height.userPositionsTitle,
          paddingBlockEnd: Spacing.sm,
          paddingInline: Spacing.md,
          flexGrow: 1,
          borderBottom: (t) => `1px solid ${t.design.Tabs.UnderLined.Default.Outline}`,
        }}
      >
        <Typography variant="headingXsBold">Your Positions</Typography>
      </Stack>

      {!provider ? (
        <Stack alignSelf="center" paddingBlock={Spacing.md}>
          <EmptyStateCard
            action={
              <Button size="medium" onClick={() => connect()}>
                {t`Connect to view positions`}
              </Button>
            }
          />
        </Stack>
      ) : (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            // needed for the bottom border to be the same height as the tabs
            alignItems="stretch"
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
      )}
    </Stack>
  )
}
