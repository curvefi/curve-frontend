import { t } from '@ui-kit/lib/i18n'
import { type ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { Delta } from './types'
import { formatValue } from './util'

export type Props = Delta & Partial<ActionInfoProps>

/** Borrow rate values the user is paying to keep the loan open */
export const BorrowRate = ({ current, next, ...actionInfoProps }: Props) => (
  <ActionInfo
    label={t`Borrow APR`}
    value={`${formatValue(next ?? current)}%`}
    {...(next != null && { prevValue: `${formatValue(current)}%` })}
    {...actionInfoProps}
  />
)
