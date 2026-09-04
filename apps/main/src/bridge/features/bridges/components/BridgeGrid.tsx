import { PartnerCard, type Partner } from '@evm-ui/shared/ui/PartnerCard'
import Grid from '@mui/material/Grid'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { SxProps } from '@ui/utils/mui'

const { Spacing } = SizesAndSpaces

export const BridgeGrid = ({ bridges, sx }: { bridges: Partner[]; sx?: SxProps }) => (
  <Grid container spacing={Spacing.md} sx={sx}>
    {bridges.map((bridge, idx) => (
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      <Grid key={`${bridge.name}_${idx}`} size={{ mobile: 12, tablet: 6, desktop: 4 }}>
        <PartnerCard {...bridge} />
      </Grid>
    ))}
  </Grid>
)
