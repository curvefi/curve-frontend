import { kebabCase } from 'lodash'
import { forwardRef, ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { ColumnFiltersState } from '@tanstack/react-table'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ToolkitIcon } from '@ui-kit/shared/icons/ToolkitIcon'
import { TableVisibilitySettingsPopover, VisibilityGroup } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'
import { FilterIcon } from '../icons/FilterIcon'
import { ReloadIcon } from '../icons/ReloadIcon'

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
 * The actual filters that are displayed on the collapse are passed as children.
 */
export const TableFilters = ({
  title,
  subtitle,
  onReload,
  onResetFilters,
  learnMoreUrl,
  visibilityGroups,
  toggleVisibility,
  collapsible,
  children,
}: {
  title: string
  subtitle: string
  learnMoreUrl: string
  onReload: () => void
  onResetFilters: () => void
  visibilityGroups: VisibilityGroup[]
  toggleVisibility: (columns: string[]) => void
  collapsible: ReactNode
  children: ReactNode
}) => {
  const [filterExpanded, setFilterExpanded] = useLocalStorage<boolean>(`filter-expanded-${kebabCase(title)}`)
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch()
  const settingsRef = useRef<HTMLButtonElement>(null)
  return (
    <Stack paddingBlockEnd={Spacing.md} maxWidth="calc(100vw - 16px)">
      <Grid container spacing={Spacing.md} paddingBlock={Spacing.sm} paddingInline={Spacing.md}>
        <Grid size={{ mobile: 6 }}>
          <Typography variant="headingSBold">{title}</Typography>
          <Typography variant="bodySRegular">{subtitle}</Typography>
        </Grid>
        <Grid container size={{ mobile: 6 }} justifyContent="flex-end" spacing={Spacing.xs} flexGrow={1}>
          <TableButton
            ref={settingsRef}
            onClick={openVisibilitySettings}
            icon={ToolkitIcon}
            testId="btn-visibility-settings"
          />
          <TableButton
            onClick={() => setFilterExpanded((prev) => !prev)}
            active={filterExpanded}
            icon={FilterIcon}
            testId="btn-expand-filters"
          />
          <TableButton onClick={onReload} icon={ReloadIcon} />
          <Button size="small" color="secondary" component={Link} href={learnMoreUrl} target="_blank">
            Learn More
          </Button>
        </Grid>
      </Grid>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        paddingInline={Spacing.md}
        flexWrap="wrap"
      >
        {children}
        <Button color="ghost" size="small" onClick={onResetFilters} data-testid="reset-filter">
          {t`Reset Filters`}
        </Button>
      </Stack>
      <Collapse in={filterExpanded}>{filterExpanded != null && collapsible}</Collapse>

      {visibilitySettingsOpen != null && settingsRef.current && (
        <TableVisibilitySettingsPopover
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

  const resetFilters = useCallback(() => setColumnFilters([]), [setColumnFilters])

  return [columnFilters, columnFiltersById, setColumnFilter, resetFilters] as const
}
