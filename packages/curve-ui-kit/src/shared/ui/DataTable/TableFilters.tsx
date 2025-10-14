import { ReactNode, useRef } from 'react'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useIsMobile, useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { useFilterExpanded } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FilterIcon } from '../../icons/FilterIcon'
import { ReloadIcon } from '../../icons/ReloadIcon'
import { ToolkitIcon } from '../../icons/ToolkitIcon'
import { TableButton } from './TableButton'
import { TableSearchField } from './TableSearchField'
import { TableVisibilitySettingsPopover } from './TableVisibilitySettingsPopover'
import type { VisibilityGroup } from './visibility.types'

const { Spacing } = SizesAndSpaces

/**
 * A component that wraps a table and provides a title, subtitle, and filter controls.
 */
export const TableFilters = <ColumnIds extends string>({
  leftChildren,
  filterExpandedKey,
  loading,
  onReload,
  visibilityGroups,
  toggleVisibility,
  hasSearchBar,
  collapsible,
  chips,
  searchText,
  onSearch,
}: {
  leftChildren: ReactNode
  filterExpandedKey: string
  loading: boolean
  onReload?: () => void
  visibilityGroups: VisibilityGroup<ColumnIds>[]
  toggleVisibility?: (columns: string[]) => void
  hasSearchBar?: boolean
  collapsible?: ReactNode // filters that may be collapsed
  chips?: ReactNode // buttons that are part of the collapsible (on mobile) or always visible (on larger screens)
  searchText: string // text to search for, only used for mobile
  onSearch: (value: string) => void
}) => {
  const [filterExpanded, setFilterExpanded] = useFilterExpanded(filterExpandedKey)
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch()
  const settingsRef = useRef<HTMLButtonElement>(null)

  const [isSearchExpanded, , , toggleSearchExpanded] = useSwitch(false)
  const isMobile = useIsMobile()
  const maxWidth = `calc(100vw${useIsTiny() ? '' : ' - 20px'})` // in tiny screens we remove the table margins completely
  const isCollapsible = collapsible || (isMobile && chips)
  return (
    <Stack paddingBlock={Spacing.md} maxWidth={maxWidth}>
      <Grid container spacing={Spacing.sm} paddingInline={Spacing.md} justifyContent="space-between">
        {!(isSearchExpanded && isMobile) && <Grid size={{ mobile: 'auto', tablet: 6 }}>{leftChildren}</Grid>}
        <Grid
          size={{ mobile: isSearchExpanded ? 12 : 'auto', tablet: 6 }}
          display="flex"
          justifyContent="flex-end"
          gap={Spacing.xs}
          flexWrap="wrap"
        >
          {!isMobile && toggleVisibility && (
            <TableButton
              ref={settingsRef}
              onClick={openVisibilitySettings}
              icon={ToolkitIcon}
              testId="btn-visibility-settings"
              active={visibilitySettingsOpen}
            />
          )}
          {isCollapsible && !isMobile && (
            <TableButton
              onClick={() => setFilterExpanded((prev) => !prev)}
              active={filterExpanded}
              icon={FilterIcon}
              testId="btn-expand-filters"
            />
          )}
          {onReload && !isMobile && <TableButton onClick={onReload} icon={ReloadIcon} loading={loading} />}
          {hasSearchBar && (
            <TableSearchField
              collapsible
              value={searchText}
              onChange={onSearch}
              testId={filterExpandedKey}
              toggleExpanded={toggleSearchExpanded}
              isExpanded={isSearchExpanded}
            />
          )}
        </Grid>
        <Grid container size={12} gap={Spacing.xs} justifyContent="space-between">
          {chips}
        </Grid>
      </Grid>
      {isCollapsible && !isMobile && <Collapse in={filterExpanded}>{collapsible}</Collapse>}

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
