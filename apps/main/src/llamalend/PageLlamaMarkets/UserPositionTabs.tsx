import { useState } from 'react'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { MarketRateType } from '@ui-kit/types/market'
import { UserPositionsTable, type UserPositionsTableProps } from './UserPositionsTable'

export const UserPositionsTabs = (props: Omit<UserPositionsTableProps, 'tab'>) => {
  const [tab, setTab] = useState<MarketRateType>(MarketRateType.Borrow) // todo: maybe keep in query string?
  const TABS: TabOption<MarketRateType>[] = [
    { value: MarketRateType.Borrow, label: t`Borrow` },
    { value: MarketRateType.Supply, label: t`Supply` },
  ]
  return (
    <Stack>
      <TabsSwitcher value={tab} onChange={setTab} variant="contained" size="small" options={TABS} />
      <UserPositionsTable {...props} tab={tab} />
    </Stack>
  )
}
