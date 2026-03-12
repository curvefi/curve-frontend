import Grid from '@mui/material/Grid'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChartCrvUsdPrice } from './components/ChartCrvUsdPrice'
import { ChartCrvUsdSupply } from './components/ChartCrvUsdSupply'

const { Spacing } = SizesAndSpaces

export const PageHome = () => (
  <Grid
    container
    spacing={Spacing.md}
    columns={{ mobile: 6, desktop: 12 }}
    sx={{ marginInline: Spacing.md, marginBlockStart: Spacing.md, marginBlockEnd: Spacing.xxl }}
    data-testid="analytics-home"
  >
    <Grid size={6}>
      <ChartCrvUsdSupply />
    </Grid>

    <Grid size={6}>
      <ChartCrvUsdPrice />
    </Grid>
  </Grid>
)
