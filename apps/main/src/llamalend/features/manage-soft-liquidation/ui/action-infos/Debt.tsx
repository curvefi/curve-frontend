import { type ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { Decimal } from '@ui-kit/utils'
import type { TokenAmount } from './types'
import { formatTokens } from './util'

export type Props = TokenAmount & { next?: Decimal } & Partial<ActionInfoProps>

/** Debt token with amount and optional new amount for comparison */
export const Debt = ({ symbol, amount, next, ...actionInfoProps }: Props) => (
  <ActionInfo
    label="Debt"
    value={`${formatTokens({ symbol, amount: next ?? amount })}`}
    {...(next != null && { prevValue: `${formatTokens({ symbol, amount })}` })}
    {...actionInfoProps}
  />
)
