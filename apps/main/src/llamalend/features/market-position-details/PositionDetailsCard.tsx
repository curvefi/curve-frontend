import { type ReactNode, useMemo } from 'react'
import { MarketRateType } from '@evm-ui/types/market'
import Stack from '@mui/material/Stack'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { useTabs } from '@ui/hooks/useTabs'
import { t } from '@ui/lib/i18n'

type PositionDetailsCardProps = {
  children: ReactNode
  activity: ReactNode
  type: MarketRateType
  hasPosition: boolean | undefined
  hasEvents: boolean
  headerAction?: ReactNode
}

const POSITION_TABS: Record<MarketRateType, string> = {
  [MarketRateType.Borrow]: 'borrowDetails',
  [MarketRateType.Supply]: 'supplyPosition',
}

export const PositionDetailsCard = (props: PositionDetailsCardProps) => {
  const { type, headerAction } = props
  const menu = useMemo(
    () => [
      {
        value: POSITION_TABS[type],
        label: t`Your position`,
        visible: ({ hasPosition, hasEvents }: PositionDetailsCardProps) => hasPosition !== false || !hasEvents,
        component: ({ children }: PositionDetailsCardProps) => <>{children}</>,
      },
      {
        value: 'activity',
        label: t`Activity`,
        visible: ({ hasEvents }: PositionDetailsCardProps) => hasEvents,
        component: ({ activity }: PositionDetailsCardProps) => <>{activity}</>,
      },
    ],
    [type],
  )
  const { tab, tabs, onChange, content } = useTabs({ menu, params: props })

  return (
    <Stack>
      <Stack direction="row" sx={{ alignItems: 'end', justifyContent: 'space-between', width: '100%' }}>
        <TabsSwitcher variant="contained" value={tab.value} onChange={onChange} options={tabs} />
        {headerAction}
      </Stack>
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{content}</Stack>
    </Stack>
  )
}
