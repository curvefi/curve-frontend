import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'
import { ReloadIcon } from '../icons/ReloadIcon'
import { FilterIcon } from '../icons/FilterIcon'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import { ReactNode, useCallback, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { kebabCase } from 'lodash'
import { ColumnFiltersState } from '@tanstack/react-table'

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
  const [isExpanded, setIsExpanded] = useLocalStorage<boolean>(`filter-expanded-${kebabCase(title)}`)
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
            onClick={() => setIsExpanded((prev) => !prev)}
            data-testid="btn-expand-filters"
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

export function useColumnFilters() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const setColumnFilter = useCallback(
    (id: string, value: unknown) =>
      setColumnFilters((filters) => [
        ...filters.filter((f) => f.id !== id),
        {
          id,
          value,
        },
      ]),
    [setColumnFilters],
  )
  const columnFiltersById = columnFilters.reduce(
    (acc, filter) => ({
      ...acc,
      [filter.id]: filter.value,
    }),
    {},
  )

  return [columnFilters, columnFiltersById, setColumnFilter] as const
}
