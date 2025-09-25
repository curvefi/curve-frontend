import ActionInfo, { type ActionInfoProps } from '@ui-kit/shared/ui/ActionInfo'
import type { PreciseNumber } from '@ui-kit/utils'
import type { TokenAmount } from './types'
import { formatTokens } from './util'

export type Props = TokenAmount & { next?: PreciseNumber } & Partial<ActionInfoProps>

/** Borrowed collateral token information */
export const Borrowed = ({ symbol, amount, next, ...actionInfoProps }: Props) => (
  <ActionInfo
    label="Borrowed collateral"
    value={`${formatTokens({ symbol, amount: next ?? amount })}`}
    {...(next != null && { prevValue: `${formatTokens({ symbol, amount })}` })}
    {...actionInfoProps}
  />
)
