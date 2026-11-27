import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { type ActivityUsdValueProps, formatActivityUsdValue } from '../utils'

export const ActivityUsdValueCell = (props: ActivityUsdValueProps) =>
  formatActivityUsdValue(props, useCurrentDate(), 'usd.amount')
