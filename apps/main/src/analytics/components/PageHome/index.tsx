import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChartCrvUsdSupply } from './components/ChartCrvUsdSupply'

const { Spacing } = SizesAndSpaces

export const PageHome = () => (
  <Stack sx={{ marginInline: Spacing.md, marginBlockStart: Spacing.md, marginBlockEnd: Spacing.xxl }}>
    <ChartCrvUsdSupply />
  </Stack>
)
