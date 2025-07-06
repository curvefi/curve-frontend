import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { Delta } from './types'
import { formatValue } from './util'

export type Props = Delta

/** LTV value indicates how big the loan is compared to the collateral */
export const Ltv = ({ current, next }: Props) => (
  <ActionInfo
    label="LTV"
    value={`${formatValue(next ?? current)}%`}
    {...(next != null && { prevValue: `${formatValue(current)}%` })}
  />
)
