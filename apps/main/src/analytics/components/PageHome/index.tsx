import Grid from '@mui/material/Grid'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChartCrvUsdPrice } from './components/ChartCrvUsdPrice'
import { ChartCrvUsdSupply } from './components/ChartCrvUsdSupply'
import { ComingSoon } from './components/ComingSoon'

const { Spacing } = SizesAndSpaces

export const PageHome = () => (
  <Grid
    container
    columnSpacing={Spacing.md}
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

    <Grid size={6} offset={{ mobile: 0, desktop: 3 }}>
      <ComingSoon />
    </Grid>
  </Grid>
)
