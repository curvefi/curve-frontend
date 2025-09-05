import ActionInfo, { type ActionInfoProps } from '@ui-kit/shared/ui/ActionInfo'
import type { Delta } from './types'
import { formatValue } from './util'

export type Props = Delta & Partial<ActionInfoProps>

/** Borrow rate values the user is paying to keep the loan open */
export const BorrowRate = ({ current, next, ...actionInfoProps }: Props) => (
  <ActionInfo
    label="Borrow Rate"
    value={`${formatValue(next ?? current)}%`}
    {...(next != null && { prevValue: `${formatValue(current)}%` })}
    {...actionInfoProps}
  />
)
