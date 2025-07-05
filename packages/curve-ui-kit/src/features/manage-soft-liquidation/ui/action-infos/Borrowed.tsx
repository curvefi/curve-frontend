import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { TokenAmount } from './types'
import { formatTokens } from './util'

export type Props = TokenAmount & { next?: number }

/** Borrowed collateral token information */
export const Borrowed = ({ symbol, amount, next }: Props) => (
  <ActionInfo
    label="Collateral"
    value={`${formatTokens({ symbol, amount: next ?? amount })}`}
    prevValue={`${formatTokens({ symbol, amount })}`}
  />
)
