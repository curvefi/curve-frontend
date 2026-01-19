import { type ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { Delta } from './types'
import { formatValue } from './util'

export type Props = Delta & Partial<ActionInfoProps>

/** The leverage multiplier if present, like 9x or 10x */
export const Leverage = ({ current, next, ...actionInfoProps }: Props) => (
  <ActionInfo
    label="Leverage"
    value={`${formatValue(next ?? current, 1)}x`}
    {...(next != null && { prevValue: `${formatValue(current, 1)}x` })}
    {...actionInfoProps}
  />
)
