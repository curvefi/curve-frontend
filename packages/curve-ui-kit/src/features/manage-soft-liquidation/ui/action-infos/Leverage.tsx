import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { Delta } from './types'
import { formatValue } from './util'

export type Props = Delta

/** The leverage multiplier if present, like 9x or 10x */
export const Leverage = ({ current, next }: Props) => (
  <ActionInfo label="Leverage" value={`${formatValue(next, 1)}x`} prevValue={`${formatValue(current, 1)}x`} />
)
