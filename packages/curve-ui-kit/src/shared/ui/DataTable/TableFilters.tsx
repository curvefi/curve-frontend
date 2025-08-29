import { forwardRef, ReactNode, useCallback, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useIsMobile, useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { useFilterExpanded, useTableFilters } from '@ui-kit/hooks/useLocalStorage'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FilterIcon } from '../../icons/FilterIcon'
import { ReloadIcon } from '../../icons/ReloadIcon'
import { ToolkitIcon } from '../../icons/ToolkitIcon'
import { TableSearchField } from './TableSearchField'
import { TableVisibilitySettingsPopover } from './TableVisibilitySettingsPopover'
import type { VisibilityGroup } from './visibility.types'

const { Spacing } = SizesAndSpaces

/**
 * A button for controlling the DataTable.
 */
const TableButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    active?: boolean
    loading?: boolean
    testId?: string
    icon: typeof SvgIcon
  }
>(function TableButton({ active, icon: Icon, testId, ...rest }, ref) {
  return (
    <IconButton
      ref={ref}
      size="small"
      data-testid={testId}
      sx={(t) => ({
        border: `1px solid ${active ? t.design.Chips.Current.Outline : t.design.Button.Outlined.Default.Outline}`,
        backgroundColor: active ? t.design.Chips.Current.Fill : 'transparent',
        transition: t.design.Button.Transition,
      })}
      {...rest}
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
  loading,
  onReload,
  visibilityGroups,
  toggleVisibility,
  collapsible,
  chips,
  sort,
  searchText,
  onSearch,
}: {
  title: string
  subtitle?: string
  loading: boolean
  onReload?: () => void
  visibilityGroups: VisibilityGroup<ColumnIds>[]
  toggleVisibility?: (columns: string[]) => void
  collapsible?: ReactNode // filters that may be collapsed
  chips?: ReactNode // buttons that are part of the collapsible (on mobile) or always visible (on larger screens)
  sort: ReactNode // sorting options, only used for mobile (larger screens can use the table header)
  searchText: string // text to search for, only used for mobile
  onSearch: (value: string) => void
}) => {
  const [filterExpanded, setFilterExpanded] = useFilterExpanded(title)
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch()
  const settingsRef = useRef<HTMLButtonElement>(null)
  const isMobile = useIsMobile()
  const maxWidth = `calc(100vw${useIsTiny() ? '' : ' - 20px'})` // in tiny screens we remove the table margins completely
  const isCollapsible = collapsible || (isMobile && chips)
  return (
    <Stack paddingBlock={Spacing.md} maxWidth={maxWidth}>
      <Grid container spacing={Spacing.sm} paddingInline={Spacing.md}>
        <Grid size={{ mobile: 6 }}>
          <Typography variant="headingSBold">{title}</Typography>
          {subtitle && <Typography variant="bodySRegular">{subtitle}</Typography>}
        </Grid>
        <Grid size={{ mobile: 6 }} display="flex" justifyContent="flex-end" gap={Spacing.xs} flexWrap="wrap">
          {!isMobile && toggleVisibility && (
            <TableButton
              ref={settingsRef}
              onClick={openVisibilitySettings}
              icon={ToolkitIcon}
              testId="btn-visibility-settings"
              active={visibilitySettingsOpen}
            />
          )}
          {isCollapsible && (
            <TableButton
              onClick={() => setFilterExpanded((prev) => !prev)}
              active={filterExpanded}
              icon={FilterIcon}
              testId="btn-expand-filters"
            />
          )}
          {onReload && <TableButton onClick={onReload} icon={ReloadIcon} loading={loading} />}
        </Grid>
        {isMobile ? (
          <>
            <Grid size={12}>
              <TableSearchField value={searchText} onChange={onSearch} />
            </Grid>
            <Grid size={{ mobile: 12 }} display={{ tablet: 'none' }}>
              {sort}
            </Grid>
          </>
        ) : (
          chips && (
            <Grid size={12} gap={0} justifyContent="flex-end">
              {chips}
            </Grid>
          )
        )}
      </Grid>
      {isCollapsible && (
        <Collapse in={filterExpanded}>
          {collapsible}
          {isMobile && chips && (
            <Box paddingInline={Spacing.md} marginBlockStart={Spacing.md}>
              {chips}
            </Box>
          )}
        </Collapse>
      )}

      {visibilitySettingsOpen != null && settingsRef.current && toggleVisibility && (
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

const DEFAULT: ColumnFiltersState = []

/**
 * A hook to manage filters for a table. Currently saved in the state, but the URL could be a better place.
 */
export function useColumnFilters(
  tableTitle: string,
  migration: MigrationOptions<ColumnFiltersState>,
  defaultFilters: ColumnFiltersState = DEFAULT,
) {
  const [columnFilters, setColumnFilters] = useTableFilters(tableTitle, defaultFilters, migration)
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
    [setColumnFilters],
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

  const resetFilters = useCallback(() => setColumnFilters(defaultFilters), [defaultFilters, setColumnFilters])

  return [columnFilters, columnFiltersById, setColumnFilter, resetFilters] as const
}
