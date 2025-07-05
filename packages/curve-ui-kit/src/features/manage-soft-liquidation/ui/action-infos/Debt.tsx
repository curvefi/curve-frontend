import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { TokenAmount } from './types'
import { formatTokens } from './util'

export type Props = TokenAmount & { next?: number }

/** Debt token with amount and optional new amount for comparison */
export const Debt = ({ symbol, amount, next }: Props) => (
  <ActionInfo
    label="Debt"
    value={`${formatTokens({ symbol, amount: next ?? amount })}`}
    prevValue={`${formatTokens({ symbol, amount })}`}
  />
)
