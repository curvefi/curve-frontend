import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import Stack from '@mui/material/Stack'
import { usePositionDetailsTabs } from './hooks/usePositionDetailsTabs'

type UserPositionProps = {
  blockchainId: string
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string | undefined
}

export const UserPosition = ({ blockchainId, chainId, poolDataCacheOrApi, poolId }: UserPositionProps) => {
  const { hasPosition, tab, tabs, onChange, content } = usePositionDetailsTabs({
    blockchainId,
    chainId,
    poolDataCacheOrApi,
    poolId,
  })

  return (
    hasPosition && (
      <Stack>
        <TabsSwitcher variant="contained" value={tab.value} onChange={onChange} options={tabs} />
        <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{content}</Stack>
      </Stack>
    )
  )
}
