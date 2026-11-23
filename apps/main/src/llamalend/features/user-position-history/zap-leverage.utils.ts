import { isZapV0MintMarket } from '@/llamalend/llama.utils'
import type { UserContractParams } from '@evm-ui/queries/query-types'
import { type ApiCollateralEvent, hasZapBorrowInOpenPosition } from './collateral-events.utils'

/**
 * Whether the open position borrowed through the leverage zap, null when the history can't tell: the prices API
 * reports the zap borrows of V0 zap mint markets as plain borrows.
 */
export const getIsZapLeveraged = (
  events: ApiCollateralEvent[],
  { blockchainId, contractAddress }: Pick<UserContractParams, 'blockchainId' | 'contractAddress'>,
) => (isZapV0MintMarket(blockchainId, contractAddress) ? null : hasZapBorrowInOpenPosition(events))
