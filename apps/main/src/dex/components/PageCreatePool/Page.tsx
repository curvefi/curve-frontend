import { CreatePool as PoolCreation } from '@/dex/components/PageCreatePool/index'
import { ConnectWalletPrompt, useCurve } from '@evm-ui/features/connect-wallet'
import Box from '@mui/material/Box'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PageCreatePool = () => {
  const { provider, curveApi } = useCurve()
  return provider && curveApi ? (
    <Box data-testid="create-pool-page" sx={{ margin: Spacing.lg }}>
      <PoolCreation curve={curveApi} />
    </Box>
  ) : (
    <ConnectWalletPrompt description="Connect wallet to access pool creation" testId="create-pool-page" />
  )
}
