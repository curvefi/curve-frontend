import type { PartialRecord } from '@primitives/objects.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ActivityColumnId } from '../columns/columns.enum'

type VisibilityProps = {
  /** Not all activity tables have the data for USD values, hence we might want to omit that column. */
  hasValue: boolean
}

type VisibilityOverrides =
  | PartialRecord<ActivityColumnId, boolean>
  | PartialRecord<'desktop' | 'mobile', PartialRecord<ActivityColumnId, boolean>>

/** Applies a flat override map on all screens or selects the map for the current screen size. */
export const useActivityVisibility = (
  { hasValue }: VisibilityProps,
  overrides?: VisibilityOverrides,
): Record<ActivityColumnId, boolean> => {
  const isMobile = useIsMobile()
  const columnOverrides =
    overrides && ('desktop' in overrides || 'mobile' in overrides)
      ? overrides[isMobile ? 'mobile' : 'desktop']
      : overrides

  return {
    [ActivityColumnId.Time]: true,
    [ActivityColumnId.Action]: true,
    [ActivityColumnId.Value]: hasValue,
    [ActivityColumnId.Amount]: !isMobile || !hasValue,
    [ActivityColumnId.Address]: !isMobile,
    ...columnOverrides,
  }
}
