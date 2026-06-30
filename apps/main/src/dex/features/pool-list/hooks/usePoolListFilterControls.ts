import { useCallback } from 'react'
import { normalizeRangeFilterDefaults } from '@ui-kit/shared/ui/DataTable/filters'
import { useDebouncedTableRangeFilter } from '@ui-kit/shared/ui/DataTable/hooks/useDebouncedTableRangeFilter'
import { emptyUrlRange } from '@ui-kit/shared/ui/DataTable/urlFilter.utils'
import {
  POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE,
  POOL_LIST_DEFAULT_TVL_MIN,
  type PoolListFilterProps,
  type PoolListNumberRange,
} from './usePoolListFilters'

type UsePoolListFilterControlsParams = {
  filterProps: PoolListFilterProps
  resetFilters: () => void
}

const getEffectiveTvlRange = ([min, max]: PoolListNumberRange): PoolListNumberRange => [
  min ?? POOL_LIST_DEFAULT_TVL_MIN,
  max,
]

export const usePoolListFilterControls = ({ filterProps, resetFilters }: UsePoolListFilterControlsParams) => {
  const {
    apyRange,
    poolType,
    poolTypeFilters,
    setApyRange,
    setPoolType,
    setTvlRange,
    setVolumeRange,
    tvlRange,
    volumeRange,
  } = filterProps

  const sanitizeNonNegativeRange = useCallback(
    (range: PoolListNumberRange) => normalizeRangeFilterDefaults(range, POOL_LIST_DEFAULT_NON_NEGATIVE_RANGE),
    [],
  )
  // TVL has a hidden default min of 10k, but filter inputs should display the effective range users are editing.
  const sanitizeTvlRange = useCallback((range: PoolListNumberRange) => getEffectiveTvlRange(range), [])

  // API-backed filters debounce URL writes from a stable table scope so pending edits survive drawer/popover close.
  const {
    draftRange: draftTvlRange,
    setDraftRange: setDraftTvlRange,
    setAppliedRange: setAppliedTvlRange,
    resetDraftRange: resetDraftTvlRange,
  } = useDebouncedTableRangeFilter({ range: tvlRange, setRange: setTvlRange, sanitize: sanitizeTvlRange })
  const {
    draftRange: draftVolumeRange,
    setDraftRange: setDraftVolumeRange,
    setAppliedRange: setAppliedVolumeRange,
    resetDraftRange: resetDraftVolumeRange,
  } = useDebouncedTableRangeFilter({ range: volumeRange, setRange: setVolumeRange, sanitize: sanitizeNonNegativeRange })
  const {
    draftRange: draftApyRange,
    setDraftRange: setDraftApyRange,
    setAppliedRange: setAppliedApyRange,
    resetDraftRange: resetDraftApyRange,
  } = useDebouncedTableRangeFilter({ range: apyRange, setRange: setApyRange })

  const resetPoolFilters = useCallback(() => {
    resetDraftTvlRange(emptyUrlRange<number>())
    resetDraftVolumeRange(emptyUrlRange<number>())
    resetDraftApyRange(emptyUrlRange<number>())
    resetFilters()
  }, [resetDraftApyRange, resetDraftTvlRange, resetDraftVolumeRange, resetFilters])

  const appliedFilterProps: PoolListFilterProps = {
    apyRange,
    poolType,
    poolTypeFilters,
    setApyRange: setAppliedApyRange,
    setPoolType,
    setTvlRange: setAppliedTvlRange,
    setVolumeRange: setAppliedVolumeRange,
    tvlRange,
    volumeRange,
  }
  const draftFilterProps: PoolListFilterProps = {
    ...appliedFilterProps,
    apyRange: draftApyRange,
    setApyRange: setDraftApyRange,
    setTvlRange: setDraftTvlRange,
    setVolumeRange: setDraftVolumeRange,
    tvlRange: draftTvlRange,
    volumeRange: draftVolumeRange,
  }

  return { appliedFilterProps, draftFilterProps, resetPoolFilters }
}
