import { useState } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { MarketRateType } from '@ui-kit/types/market'
import { UserPositionsTable, type UserPositionsTableProps } from './UserPositionsTable'

const tabs: TabOption<MarketRateType>[] = [
  { value: MarketRateType.Borrow, label: t`Borrow` },
  { value: MarketRateType.Supply, label: t`Supply` },
]

/** Show the first tab that has user positions by default, or the first tab if none are found. */
const getDefault = (userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined) =>
  tabs.find(({ value }) => userHasPositions?.Lend[value] || userHasPositions?.Mint[value]) ?? tabs[0]

export const UserPositionsTabs = (props: Omit<UserPositionsTableProps, 'tab'>) => {
  const defaultTab = getDefault(props.result?.userHasPositions).value
  const [tab, setTab] = useState<MarketRateType>(defaultTab)
  return (
    <Stack>
      <TabsSwitcher value={tab} onChange={setTab} variant="contained" size="medium" options={tabs} />
      <UserPositionsTable {...props} tab={tab} />
    </Stack>
  )
}
