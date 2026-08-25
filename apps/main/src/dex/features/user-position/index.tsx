import { type ReactNode, useMemo } from 'react'
import { LiquidityDetails } from '@/dex/features/user-position/liquidity-details'
import { useLiquidityDetails } from '@/dex/features/user-position/liquidity-details/hooks/useLiquidityDetails'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { t } from '@evm-ui/lib/i18n'
import { Tabs } from '@evm-ui/shared/ui/Tabs/Tabs'
import Stack from '@mui/material/Stack'

type UserPositionProps = {
  blockchainId: string
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string | undefined
}

const menu = [
  { value: 'liquidityDetails', label: t`Liquidity Details`, component: LiquidityDetails },
  // There'll be a (user) activity tab here in the future (as per Figma)
]

const Content = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
)

export const UserPosition = ({ blockchainId, chainId, poolDataCacheOrApi, poolId }: UserPositionProps) => {
  const params = useMemo(
    () => ({ blockchainId, chainId, poolDataCacheOrApi, poolId }),
    [blockchainId, chainId, poolDataCacheOrApi, poolId],
  )
  const { hasPosition } = useLiquidityDetails(params)
  return (
    hasPosition && (
      <Stack>
        <Tabs menu={menu} params={params} ContentWrapper={Content} />
      </Stack>
    )
  )
}
