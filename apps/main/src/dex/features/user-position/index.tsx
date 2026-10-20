import type { ReactNode } from 'react'
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
  const { chainId, blockchainId, poolAddress, tokenAddresses } = usePoolContext()
  const liquidityDetails = useLiquidityDetails({ chainId, poolAddress, tokenAddresses })
  return (
    liquidityDetails.hasPosition && (
      <Stack>
        <Tabs menu={menu} params={{ blockchainId, ...liquidityDetails }} ContentWrapper={Content} />
      </Stack>
    )
  )
}
