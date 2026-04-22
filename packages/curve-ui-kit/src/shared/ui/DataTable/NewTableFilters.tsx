import { ReactNode, useRef } from 'react'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useDebounce } from '@ui-kit/hooks/useDebounce'
import { useFilterExpanded } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FilterIcon } from '../../icons/FilterIcon'
import { GridChip } from './chips/GridChip'
import { NewTableButton } from './NewTableButton'
import { NewTableSearchField } from './NewTableSearchField'
import { TableVisibilitySettingsPopover } from './TableVisibilitySettingsPopover'
import type { VisibilityGroup } from './visibility.types'

const { Spacing } = SizesAndSpaces

/**
 * A component that wraps a table and provides a title, subtitle, and filter controls.
 */
export const NewTableFilters = <ColumnIds extends string>({
  header,
  filterExpandedKey,
  visibilityGroups,
  toggleVisibility,
  collapsible,
  chips,
  searchText,
  disableSearchAutoFocus,
  onSearch,
}: {
  header: ReactNode
  filterExpandedKey: string
  visibilityGroups: VisibilityGroup<ColumnIds>[]
  toggleVisibility?: (columns: string[]) => void
  collapsible?: ReactNode // filters that may be collapsed
  chips?: ReactNode // buttons that are part of the collapsible (on mobile) or always visible (on larger screens)
  searchText: string // text to search for, only used for mobile
  disableSearchAutoFocus?: boolean
  onSearch: (value: string) => void
}) => {
  const [filterExpanded, setFilterExpanded] = useFilterExpanded(filterExpandedKey)
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch()
  const settingsRef = useRef<HTMLButtonElement>(null)
  // search is here because we remove the table title when searching on mobile
  const isMobile = useIsMobile()
  const [searchValue, setSearchValue] = useDebounce({ initialValue: searchText, callback: onSearch })
  const isCollapsible = collapsible || (isMobile && chips)

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      {header}
      <Grid container spacing={Spacing.lg} justifyContent="space-between" alignItems="center">
        <Grid size={{ mobile: 12, tablet: 7 }} padding={Spacing.sm} display="flex">
          <GridChip
            label={t`Filters`}
            selectableChipSize="large"
            selected={filterExpanded}
            icon={<FilterIcon />}
            toggle={() => setFilterExpanded((prev) => !prev)}
            data-testid="btn-expand-filters"
          />

          <NewTableSearchField
            value={searchValue}
            onChange={setSearchValue}
            testId={filterExpandedKey}
            disableAutoFocus={disableSearchAutoFocus}
          />
        </Grid>
        {!isMobile && (
          <Grid container size="grow" spacing={Spacing.sm} justifyContent="flex-end">
            {chips}
            <NewTableButton
              ref={settingsRef}
              onClick={openVisibilitySettings}
              icon={GearIcon}
              testId="btn-visibility-settings"
              active={visibilitySettingsOpen}
            />
          </Grid>
        )}
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
