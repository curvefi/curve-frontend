import Grid from '@mui/material/Grid'
import { PartnerCard, type Partner } from '@ui-kit/shared/ui/PartnerCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { SxProps } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const BridgeGrid = ({ bridges, sx }: { bridges: Partner[]; sx?: SxProps }) => (
  <Grid container spacing={Spacing.md} sx={sx}>
    {bridges.map((bridge, idx) => (
      <Grid key={`${bridge.name}_${idx}`} size={{ mobile: 12, tablet: 6, desktop: 4 }}>
        <PartnerCard {...bridge} />
      </Grid>
    ))}
  </Grid>
)
