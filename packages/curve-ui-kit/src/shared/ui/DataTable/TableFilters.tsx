import { ReactNode, useRef } from 'react'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useFilterExpanded } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Duration } from '@ui-kit/themes/design/0_primitives'
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
  // search is here because we remove the table title when searching on mobile
  const [isSearchExpanded, , , toggleSearchExpanded] = useSwitch(false)
  const isMobile = useIsMobile()
  const isCollapsible = collapsible || (isMobile && chips)
  const isExpandedOrValue = Boolean(isSearchExpanded || searchText)
  const hideTitle = hasSearchBar && isExpandedOrValue && isMobile
  return (
    <Stack paddingBlockEnd={{ mobile: Spacing.sm.tablet }} paddingBlockStart={{ mobile: Spacing.md.tablet }}>
      <Grid container spacing={Spacing.sm} paddingInline={Spacing.md} justifyContent="space-between">
        <Fade in={!hideTitle} timeout={Duration.Transition} mountOnEnter unmountOnExit>
          <Grid size={{ mobile: 'grow', tablet: 6 }} sx={{ position: hideTitle ? 'absolute' : 'relative' }}>
            {leftChildren}
          </Grid>
        </Fade>
        <Grid
          size={{ mobile: isExpandedOrValue ? 12 : 'auto', tablet: 6 }}
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
          {onReload && !isMobile && <TableButton onClick={onReload} icon={ReloadIcon} rotateIcon={loading} />}
          {hasSearchBar && (
            <TableSearchField
              value={searchText}
              onChange={onSearch}
              testId={filterExpandedKey}
              toggleExpanded={toggleSearchExpanded}
              isExpanded={isExpandedOrValue}
            />
          )}
        </Grid>
        <Grid container size={12} spacing={Spacing.sm} justifyContent="space-between">
          {chips}
        </Grid>
      </Grid>
      {isCollapsible && !isMobile && <Collapse in={filterExpanded}>{collapsible}</Collapse>}

      {visibilitySettingsOpen != null && toggleVisibility && (
        <TableVisibilitySettingsPopover<ColumnIds>
          anchorRef={settingsRef}
          visibilityGroups={visibilityGroups}
          toggleVisibility={toggleVisibility}
          open={visibilitySettingsOpen}
          onClose={closeVisibilitySettings}
        />
      )}
    </Stack>
  )
}
