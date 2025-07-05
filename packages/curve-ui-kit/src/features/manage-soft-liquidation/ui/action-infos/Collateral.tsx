import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { TokenAmount } from './types'
import { formatTokens } from './util'

export type Props = { collateral: TokenAmount[] }

/** Array of collateral assets - only renders when provided */
export const Collateral = ({ collateral }: Props) =>
  collateral.map((c, i) => (
    <ActionInfo key={`collateral-${c.symbol}`} label={i === 0 ? 'Collateral' : ''} value={`${formatTokens(c)}`} />
  ))
