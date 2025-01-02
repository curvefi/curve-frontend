import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'
import { ReloadIcon } from '../icons/ReloadIcon'
import { FilterIcon } from '../icons/FilterIcon'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import Collapse from '@mui/material/Collapse'
import { ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'

const {
  Spacing,
  Grid: { Column_Spacing },
} = SizesAndSpaces

export const TableFilters = ({
  title,
  subtitle,
  onReload,
  learnMoreUrl,
  children,
}: {
  title: string
  subtitle: string
  learnMoreUrl: string
  onReload: () => void
  children: ReactNode
}) => {
  const [isExpanded, , , toggle] = useSwitch()
  const {
    design: {
      Button: { Outlined, Transition },
      Chips,
      Layer,
    },
  } = useTheme()
  return (
    <Box sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md, backgroundColor: Layer[1].Fill }}>
      <Grid container spacing={Column_Spacing}>
        <Grid size={{ tablet: 6, mobile: 12 }}>
          <Typography variant="headingSBold">{title}</Typography>
          <Typography variant="bodySRegular">{subtitle}</Typography>
        </Grid>
        <Grid container size={{ tablet: 6, mobile: 12 }} justifyContent="flex-end" spacing={Spacing.xs} flexGrow={1}>
          <IconButton
            size="small"
            onClick={toggle}
            sx={{
              border: `1px solid ${isExpanded ? Chips.Current.Outline : Chips.Default.Stroke}`,
              backgroundColor: isExpanded ? Chips.Current.Fill : 'transparent',
              transition: Transition,
            }}
          >
            <FilterIcon />
          </IconButton>
          <IconButton size="small" onClick={onReload} sx={{ border: `1px solid ${Outlined.Default.Outline}` }}>
            <ReloadIcon />
          </IconButton>
          <Button size="small" color="secondary" component={Link} href={learnMoreUrl} target="_blank">
            Learn More
          </Button>
        </Grid>
      </Grid>
      <Collapse in={isExpanded}>{isExpanded != null && children}</Collapse>
    </Box>
  )
}
