import { forwardRef, ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useFilterExpanded } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FilterIcon } from '../../icons/FilterIcon'
import { ReloadIcon } from '../../icons/ReloadIcon'
import { ToolkitIcon } from '../../icons/ToolkitIcon'
import { TableSearchField } from './TableSearchField'
import { TableVisibilitySettingsPopover, VisibilityGroup } from './TableVisibilitySettingsPopover'

const { Spacing } = SizesAndSpaces

/**
 * A button for controlling the DataTable.
 */
const TableButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    active?: boolean
    testId?: string
    icon: typeof SvgIcon
  }
>(function TableButton({ onClick, active, icon: Icon, testId }, ref) {
  return (
    <IconButton
      ref={ref}
      size="small"
      onClick={onClick}
      data-testid={testId}
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
 */
export const TableFilters = <ColumnIds extends string>({
  title,
  subtitle,
  onReload,
  learnMoreUrl,
  visibilityGroups,
  toggleVisibility,
  collapsible,
  chips,
  sort,
  onSearch,
}: {
  title: string
  subtitle: string
  learnMoreUrl: string
  onReload: () => void
  visibilityGroups: VisibilityGroup<ColumnIds>[]
  toggleVisibility: (columns: string[]) => void
  collapsible: ReactNode // filters that may be collapsed
  chips: ReactNode // buttons that are part of the collapsible (on mobile) or always visible (on larger screens)
  sort: ReactNode // sorting options, only used for mobile (larger screens can use the table header)
  onSearch: (value: string) => void
}) => {
  const [filterExpanded, setFilterExpanded] = useFilterExpanded(title)
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch()
  const settingsRef = useRef<HTMLButtonElement>(null)
  const isMobile = useMediaQuery((t) => t.breakpoints.down('tablet'))
  return (
    <Stack paddingBlock={Spacing.md} maxWidth="calc(100vw - 16px)">
      <Grid container spacing={Spacing.sm} paddingInline={Spacing.md}>
        <Grid size={{ mobile: 6 }}>
          <Typography variant="headingSBold">{title}</Typography>
          <Typography variant="bodySRegular">{subtitle}</Typography>
        </Grid>
        <Grid size={{ mobile: 6 }} display="flex" justifyContent="flex-end" gap={Spacing.xs} flexWrap="wrap">
          {!isMobile && (
            <TableButton
              ref={settingsRef}
              onClick={openVisibilitySettings}
              icon={ToolkitIcon}
              testId="btn-visibility-settings"
              active={visibilitySettingsOpen}
            />
          )}
          <TableButton
            onClick={() => setFilterExpanded((prev) => !prev)}
            active={filterExpanded}
            icon={FilterIcon}
            testId="btn-expand-filters"
          />
          <TableButton onClick={onReload} icon={ReloadIcon} />
          {!isMobile && (
            <Button size="small" color="secondary" component={Link} href={learnMoreUrl} target="_blank">
              Learn More
            </Button>
          )}
        </Grid>
        <Grid size={{ mobile: 12, tablet: 5, desktop: 4 }}>
          <TableSearchField onSearch={onSearch} />
        </Grid>
        <Grid size={{ mobile: 12 }} display={{ tablet: 'none' }}>
          {sort}
        </Grid>
        {!isMobile && (
          <Grid size={{ tablet: 7, desktop: 8 }} gap={0} justifyContent="flex-end">
            {chips}
          </Grid>
        )}
      </Grid>
      <Collapse in={filterExpanded}>
        {collapsible}
        {isMobile && (
          <Box paddingInline={Spacing.md} marginBlockStart={Spacing.md}>
            {chips}
          </Box>
        )}
      </Collapse>

      {visibilitySettingsOpen != null && settingsRef.current && (
        <TableVisibilitySettingsPopover<ColumnIds>
          anchorEl={settingsRef.current}
          visibilityGroups={visibilityGroups}
          toggleVisibility={toggleVisibility}
          open={visibilitySettingsOpen}
          onClose={closeVisibilitySettings}
        />
      )}
    </Stack>
  )
}

/**
 * A hook to manage filters for a table. Currently saved in the state, but the URL could be a better place.
 */
export function useColumnFilters(defaultFilters: ColumnFiltersState = []) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters)
  const setColumnFilter = useCallback(
    (id: string, value: unknown) =>
      setColumnFilters((filters) => [
        ...filters.filter((f) => f.id !== id),
        ...(value == null
          ? []
          : [
              {
                id,
                value,
              },
            ]),
      ]),
    [],
  )
  const columnFiltersById: Record<string, unknown> = useMemo(
    () =>
      columnFilters.reduce(
        (acc, filter) => ({
          ...acc,
          [filter.id]: filter.value,
        }),
        {},
      ),
    [columnFilters],
  )

  const resetFilters = useCallback(() => setColumnFilters(defaultFilters), [defaultFilters])

  return [columnFilters, columnFiltersById, setColumnFilter, resetFilters] as const
}
