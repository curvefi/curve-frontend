import type { ChainId } from '@/dao/types/dao.types'
import type { UserChainQuery } from '@evm-ui/queries/root-keys'
import { CRVUSD_ADDRESS, THREECRV_ADDRESS } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { FieldsOf } from '@ui/lib/validation/types'

export const CLAIM_FEES_TOKENS = { ThreeCRV: '3CRV', crvUSD: 'crvUSD' } as const
export type ClaimFeesToken = (typeof CLAIM_FEES_TOKENS)[keyof typeof CLAIM_FEES_TOKENS]

export const CLAIM_TOKEN_ADDRESSES = { '3CRV': THREECRV_ADDRESS, crvUSD: CRVUSD_ADDRESS } satisfies Record<
  ClaimFeesToken,
  Address
>

export type ClaimFeesQuery = UserChainQuery<ChainId> & { token: ClaimFeesToken }
export type ClaimFeesParams = FieldsOf<ClaimFeesQuery>

export type ClaimFeesMutation = Pick<ClaimFeesQuery, 'token'>
