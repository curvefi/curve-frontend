import { type ReactNode, useMemo } from 'react'
import { useLiquidityDetails } from '@/dex/features/user-position/liquidity-details/hooks/useLiquidityDetails'
import Stack from '@mui/material/Stack'
import { Tabs } from '@ui/components/Tabs/Tabs'
import { LiquidityDetails } from '@ui/features/pools/liquidity-details/LiquidityDetails'
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
  const { chainId, blockchainId, poolId, tokens, tokenAddresses } = usePoolContext()
  const params = useMemo(
    () => ({ blockchainId, chainId, poolId, tokens, tokenAddresses }),
    [blockchainId, chainId, poolId, tokens, tokenAddresses],
  )
  const liquidityDetails = useLiquidityDetails(params)
  return (
    liquidityDetails.hasPosition && (
      <Stack>
        <Tabs menu={menu} params={{ blockchainId, ...liquidityDetails }} ContentWrapper={Content} />
      </Stack>
    )
  )
}
