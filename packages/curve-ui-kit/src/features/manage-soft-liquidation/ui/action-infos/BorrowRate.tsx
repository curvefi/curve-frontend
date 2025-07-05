import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { Delta } from './types'
import { formatValue } from './util'

export type Props = Delta

/** Borrow rate values the user is paying to keep the loan open */
export const BorrowRate = ({ current, next }: Props) => (
  <ActionInfo label="Borrow Rate" value={`${formatValue(next)}%`} prevValue={`${formatValue(current)}%`} />
)
