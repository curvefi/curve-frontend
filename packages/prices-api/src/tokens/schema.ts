import { z } from 'zod/v4'
import { address, camelizeKeys, lpCoins } from '../schemas'

export const getTokenResponse = z
  .object({
    address,
    symbol: z.string(),
    lp_coins: lpCoins,
    /** The pool of an LP token, which differs from the token for older pools like 3Crv */
    pool_address: address.nullable(),
  })
  .transform(camelizeKeys)

export type TokenMetadata = z.infer<typeof getTokenResponse>
