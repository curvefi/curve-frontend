import { type ReactNode, useMemo } from 'react'
import { LiquidityDetails } from '@/dex/features/user-position/liquidity-details'
import { useLiquidityDetails } from '@/dex/features/user-position/liquidity-details/hooks/useLiquidityDetails'
import { Tabs } from '@evm-ui/shared/ui/Tabs/Tabs'
import Stack from '@mui/material/Stack'
import { t } from '@ui/lib/i18n'
import { usePoolContext } from '../pool-context'

const menu = [
  { value: 'liquidityDetails', label: t`Liquidity Details`, component: LiquidityDetails },
  // There'll be a (user) activity tab here in the future (as per Figma)
]

const Content = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
)

export const UserPosition = () => {
  const { chainId, blockchainId, poolId, poolData } = usePoolContext()
  const params = useMemo(() => ({ blockchainId, chainId, poolData, poolId }), [blockchainId, chainId, poolData, poolId])
  const { hasPosition } = useLiquidityDetails(params)
  return (
    hasPosition && (
      <Stack>
        <Tabs menu={menu} params={params} ContentWrapper={Content} />
      </Stack>
    )
  )
}
