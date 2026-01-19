import { type ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { TokenAmount } from './types'
import { formatTokens } from './util'

export type Props = { assetsToWithdraw: TokenAmount[] } & Partial<ActionInfoProps>

/** Assets the user gets when withdrawing or closing the position */
export const AssetsToWithdraw = ({ assetsToWithdraw, ...actionInfoProps }: Props) => (
  <ActionInfo label="Assets to withdraw" value={`${formatTokens(assetsToWithdraw)}`} {...actionInfoProps} />
)
