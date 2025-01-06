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
import { forwardRef, ReactNode, useCallback, useRef, useState } from 'react'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { kebabCase } from 'lodash'
import { ColumnFiltersState } from '@tanstack/react-table'
import SvgIcon from '@mui/material/SvgIcon'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { ColumnVisibilityGroup, TableColumnVisibilityPopover } from '@ui-kit/shared/ui/TableColumnVisibilityPopover'
import { ToolkitIcon } from '@ui-kit/shared/icons/ToolkitIcon'

const {
  Spacing,
  Grid: { Column_Spacing },
} = SizesAndSpaces

/**
 * A button for controlling the DataTable.
 */
const TableButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    active?: boolean
    icon: typeof SvgIcon
  }
>(function TableButton({ onClick, active, icon: Icon }, ref) {
  return (
    <IconButton
      ref={ref}
      size="small"
      onClick={onClick}
      data-testid="btn-expand-filters"
      sx={(t) => ({
        border: `1px solid ${active ? t.design.Chips.Current.Outline : t.design.Button.Outlined.Default.Outline}`,
        backgroundColor: active ? t.design.Chips.Current.Fill : 'transparent',
        transition: t.design.Button.Transition,
      })}
    >
      <Icon />
    </IconButton>
  )
})

/**
 * A component that wraps a table and provides a title, subtitle, and filter controls.
 * The actual filters that are displayed on the collapse are passed as children.
 */
export const TableFilters = ({
  title,
  subtitle,
  onReload,
  learnMoreUrl,
  columnVisibilityGroups,
  toggleColumnVisibility,
  children,
}: {
  title: string
  subtitle: string
  learnMoreUrl: string
  onReload: () => void
  columnVisibilityGroups: ColumnVisibilityGroup[]
  toggleColumnVisibility: (columnId: string) => void
  children: ReactNode
}) => {
  const [filterExpanded, setFilterExpanded] = useLocalStorage<boolean>(`filter-expanded-${kebabCase(title)}`)
  const [settingsOpen, openSettings, closeSettings] = useSwitch()
  const settingsRef = useRef<HTMLButtonElement>(null)
  return (
    <Box sx={{ paddingBlock: Spacing.sm, paddingInline: Spacing.md, backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <Grid container spacing={Column_Spacing}>
        <Grid size={{ tablet: 6, mobile: 12 }}>
          <Typography variant="headingSBold">{title}</Typography>
          <Typography variant="bodySRegular">{subtitle}</Typography>
        </Grid>
        <Grid container size={{ tablet: 6, mobile: 12 }} justifyContent="flex-end" spacing={Spacing.xs} flexGrow={1}>
          <TableButton ref={settingsRef} onClick={openSettings} icon={ToolkitIcon} />
          <TableButton onClick={() => setFilterExpanded((prev) => !prev)} active={filterExpanded} icon={FilterIcon} />
          <TableButton onClick={onReload} icon={ReloadIcon} />
          <Button size="small" color="secondary" component={Link} href={learnMoreUrl} target="_blank">
            Learn More
          </Button>
        </Grid>
      </Grid>
      <Collapse in={filterExpanded}>{filterExpanded != null && children}</Collapse>

      {settingsOpen != null && settingsRef.current && (
        <TableColumnVisibilityPopover
          anchorEl={settingsRef.current}
          columnVisibilityGroups={columnVisibilityGroups}
          toggleColumnVisibility={toggleColumnVisibility}
          open={settingsOpen}
          onClose={closeSettings}
        />
      )}
    </Box>
  )
}

/**
 * A hook to manage filters for a table. Currently saved in the state, but the URL could be a better place.
 */
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
