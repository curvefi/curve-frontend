import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import { findTab } from '@ui-kit/hooks/useTabs'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'

type UserPositionProps = {
  blockchainId: string
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string | undefined
}

export const UserPosition = ({ blockchainId, chainId, poolDataCacheOrApi, poolId }: UserPositionProps) => {
  const { hasPosition, tab, onTabChange, tabOptions } = usePositionDetailsTabs({
    blockchainId,
    chainId,
    poolDataCacheOrApi,
    poolId,
  })
  const activeTab = findTab(tabOptions, tab)

  return (
    hasPosition && (
      <Stack>
        <TabsSwitcher variant="contained" value={tab} onChange={onTabChange} options={tabOptions} />
        <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{activeTab.render()}</Stack>
      </Stack>
    )
  )
}
