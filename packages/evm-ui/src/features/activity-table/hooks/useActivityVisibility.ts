import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ActivityColumnId } from '../columns/columns.enum'

type VisibilityProps = {
  /** Not all activity tables have the data for USD values, hence we might want to omit that column. */
  hasValue: boolean
}

const getDesktopColumnVisibility = ({ hasValue }: VisibilityProps): Record<ActivityColumnId, boolean> => ({
  [ActivityColumnId.Time]: true,
  [ActivityColumnId.Action]: true,
  [ActivityColumnId.Value]: hasValue,
  [ActivityColumnId.Amount]: true,
  [ActivityColumnId.Address]: true,
})

const getMobileColumnVisibility = ({ hasValue }: VisibilityProps): Record<ActivityColumnId, boolean> => ({
  [ActivityColumnId.Time]: true,
  [ActivityColumnId.Action]: true,
  // Prefer showing dollar value, unless not supported, then we fallback to the (token) amount
  [ActivityColumnId.Value]: hasValue,
  [ActivityColumnId.Amount]: !hasValue,
  [ActivityColumnId.Address]: false,
})

/**
 * Returns column visibility settings for the ActivityTable based on the current screen size.
 * Params are explicitly required without defaults for clarity.
 */
export const useActivityVisibility = (params: VisibilityProps) =>
  useIsMobile() ? getMobileColumnVisibility(params) : getDesktopColumnVisibility(params)
