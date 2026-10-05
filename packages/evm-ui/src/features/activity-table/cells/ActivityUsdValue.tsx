import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { ActivityUsdValueProps, formatActivityUsdValue } from '../utils'

export const ActivityUsdValue = ({ amount, amountUsd, timestamp, isSold }: ActivityUsdValueProps) =>
  formatActivityUsdValue({ amount, amountUsd, timestamp, isSold }, useCurrentDate())
