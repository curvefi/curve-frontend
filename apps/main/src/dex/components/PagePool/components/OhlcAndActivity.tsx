import type { ReactNode } from 'react'
import { usePoolActivityLiquidityTable } from '@/dex/features/pool-activity/hooks/usePoolActivityLiquidityTable'
import { usePoolActivitySwapsTable } from '@/dex/features/pool-activity/hooks/usePoolActivitySwapsTable'
import { LiquidityTab } from '@/dex/features/pool-activity/LiquidityTab'
import { SwapsTab } from '@/dex/features/pool-activity/SwapsTab'
import { ChartTab } from '@/dex/features/pool-ohlc/ChartTab'
import { useOhlcChart } from '@/dex/features/pool-ohlc/hooks/useOhlcChart'
import { ChainId } from '@/dex/types/main.types'
import type { V2PoolDetails } from '@curvefi/prices-api/pools'
import Stack from '@mui/material/Stack'
import { Tabs } from '@ui/components/Tabs/Tabs'
import { t } from '@ui/lib/i18n'

const menu = [
  { value: 'chart', label: t`Chart`, component: ChartTab },
  { value: 'swaps', label: t`Swaps`, component: SwapsTab },
  { value: 'liquidity', label: t`Liquidity`, component: LiquidityTab },
]

const OhlcTabsContent = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
)

export const OhlcAndActivity = ({
  chainId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  pricesApiPoolData: V2PoolDetails
}) => {
  const chart = useOhlcChart({ chainId, pricesApiPoolData })
  const liquidityTable = usePoolActivityLiquidityTable()
  const swapsTable = usePoolActivitySwapsTable()

  return (
    <Stack>
      <Tabs
        menu={menu}
        params={{ chart, liquidityTable, swapsTable }}
        variant="contained"
        ContentWrapper={OhlcTabsContent}
      />
    </Stack>
  )
}
