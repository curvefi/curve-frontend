import { DeployGauge } from '@/dex/components/PageDeployGauge/index'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useParams } from '@ui/hooks/router'

const { Spacing } = SizesAndSpaces

export const PageDeployGauge = () => (
  <Box data-testid="deploy-gauge-page" sx={{ margin: Spacing.lg }}>
    <DeployGauge {...useParams<NetworkUrlParams>()} />
  </Box>
)
