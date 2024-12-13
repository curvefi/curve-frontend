import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const TableFilters = ({
  title,
  subtitle,
  onReload,
}: {
  title: string
  subtitle: string
  onReload: () => void
}) => (
  <Card sx={{ paddingY: Spacing.xs, backgroundColor: (t) => t.design.Layer[1].Fill }}>
    <Grid container spacing={Spacing.sm}>
      <Grid size={{ tablet: 6, mobile: 12 }} paddingY={Spacing.sm} paddingX={Spacing.md}>
        <Typography variant="headingSBold">{title}</Typography>
        <Typography variant="bodySRegular">{subtitle}</Typography>
      </Grid>
      <Grid container size={{ tablet: 6, mobile: 12 }} justifyContent="flex-end" spacing={Spacing.sm}>
        <IconButton size="small" onClick={onReload}>
          <RefreshIcon />
        </IconButton>
      </Grid>
    </Grid>
  </Card>
)
