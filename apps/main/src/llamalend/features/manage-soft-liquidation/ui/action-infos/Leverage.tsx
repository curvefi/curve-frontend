import { type ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { formatNumber } from '@ui-kit/utils'
import type { Delta } from './types'

export type Props = Delta & Partial<ActionInfoProps>

/** The leverage multiplier if present, like 9x or 10x */
export const Leverage = ({ current, next, ...actionInfoProps }: Props) => (
  <ActionInfo
    label="Leverage"
    value={formatNumber(next ?? current, 'multiplier')}
    {...(next != null && { prevValue: formatNumber(current, 'multiplier') })}
    {...actionInfoProps}
  />
)
