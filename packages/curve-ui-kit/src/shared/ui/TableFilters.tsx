import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'
import { ReloadIcon } from '../icons/ReloadIcon'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'

const {
  Spacing,
  Grid: { Column_Spacing },
} = SizesAndSpaces

export const TableFilters = ({
  title,
  subtitle,
  onReload,
  learnMoreUrl,
}: {
  title: string
  subtitle: string
  learnMoreUrl: string
  onReload: () => void
}) => (
  <Card sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md, backgroundColor: (t) => t.design.Layer[1].Fill }}>
    <Grid container spacing={Column_Spacing}>
      <Grid size={{ tablet: 6, mobile: 12 }}>
        <Typography variant="headingSBold">{title}</Typography>
        <Typography variant="bodySRegular">{subtitle}</Typography>
      </Grid>
      <Grid container size={{ tablet: 6, mobile: 12 }} alignItems="flex-end" spacing={0}>
        {/* extra grid container because buttons have spacing, but the "learn more" doesn't */}
        <Grid container spacing={Spacing.xs} flexGrow={1} justifyContent="flex-end">
          <Grid>
            <IconButton size="small" onClick={onReload}>
              <ReloadIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid>
          <Button size="small" color="secondary" component={Link} href={learnMoreUrl} target="_blank">
            Learn More
          </Button>
        </Grid>
      </Grid>
    </Grid>
  </Card>
)
