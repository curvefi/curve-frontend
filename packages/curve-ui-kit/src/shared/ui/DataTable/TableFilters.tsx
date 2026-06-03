import { ReactNode, useRef } from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableButton } from './TableButton'
import { TableSearchField } from './TableSearchField'
import { TableVisibilitySettingsPopover } from './TableVisibilitySettingsPopover'
import type { VisibilityGroup } from './visibility.types'

const { Spacing } = SizesAndSpaces

/**
 * A component that wraps a table and provides a title, subtitle, and filter controls.
 */
export const TableFilters = <ColumnIds extends string>({
  testIdPrefix,
  visibilityGroups,
  toggleVisibility,
  collapsibleFilters,
  chips,
  filterChip,
  sortChip,
  searchText,
  disableSearchAutoFocus,
  onSearch,
}: {
  testIdPrefix: string
  visibilityGroups: VisibilityGroup<ColumnIds>[]
  toggleVisibility?: (columns: string[]) => void
  filtersOverlay?: ReactNode // filters shown in the filter overlay (popover or drawer for mobile)
  // collabsible bar that displays the active filters
  collapsibleFilters?: { collapsible: ReactNode; hasActiveFilters?: boolean | undefined }
  chips?: ReactNode // buttons that are part of the collapsible (on mobile) or always visible (on larger screens)
  filterChip?: ReactNode // buttons responsible for filtering
  sortChip?: ReactNode // buttons responsible for sorting
  searchText: string // text to search for, only used for mobile
  disableSearchAutoFocus?: boolean
  onSearch: (value: string) => void
}) => {
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch()
  const settingsRef = useRef<HTMLButtonElement>(null)
  // search is here because we remove the table title when searching on mobile
  const isMobile = useIsMobile()
  const { collapsible, hasActiveFilters } = collapsibleFilters ?? {}

  return (
    <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <Grid
        container
        spacing={Spacing.lg}
        sx={{ padding: Spacing.sm, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Grid
          size={{ mobile: 12, tablet: 7 }}
          sx={{
            display: 'flex',
            // overlap adjacent component to avoid duplicate border width
            '& > .tableControl + .tableControl': { marginLeft: '-1px' },
          }}
        >
          {/* Box wrapper needed for applying style */}
          {filterChip && <Box className="tableControl">{filterChip}</Box>}
          <Box className="tableControl" sx={{ flex: 1, minWidth: 0 }}>
            <TableSearchField
              value={searchText}
              onChange={onSearch}
              testId={testIdPrefix}
              disableAutoFocus={disableSearchAutoFocus}
            />
          </Box>
          {sortChip && <Box className="tableControl">{sortChip}</Box>}
        </Grid>
        {!isMobile && (
          <Grid container size="grow" spacing="none" sx={{ justifyContent: 'flex-end' }}>
            {chips}
            <TableButton
              ref={settingsRef}
              onClick={openVisibilitySettings}
              icon={GearIcon}
              testId="btn-visibility-settings"
              active={visibilitySettingsOpen}
            />
          </Grid>
        )}
      </Grid>
      {collapsible && <Collapse in={!!hasActiveFilters || isMobile}>{collapsible}</Collapse>}
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
