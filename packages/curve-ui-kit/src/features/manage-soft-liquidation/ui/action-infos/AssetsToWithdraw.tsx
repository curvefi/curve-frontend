import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import type { TokenAmount } from './types'
import { formatTokens } from './util'

export type Props = { assetsToWithdraw: TokenAmount[] }

/** Assets the user gets when withdrawing or closing the position */
export const AssetsToWithdraw = ({ assetsToWithdraw }: Props) => (
  <ActionInfo label="Assets to withdraw" value={`${formatTokens(assetsToWithdraw)}`} />
)
