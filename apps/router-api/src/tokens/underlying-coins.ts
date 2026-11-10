import { getAddress } from 'viem'
import { NETWORK_CONSTANTS } from '@curvefi/api/lib/constants/network_constants.js'
import type { INetworkConstants } from '@curvefi/api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { zip } from '@primitives/array.utils'
import { maybe, recordValues } from '@primitives/objects.utils'

export const getUnderlyingCoins = (chainId: number, address: Address) => {
  const pools = (NETWORK_CONSTANTS[chainId] as { POOLS_DATA: INetworkConstants['POOLS_DATA'] } | undefined)?.POOLS_DATA
  const pool = maybe(pools, pools =>
    recordValues(pools).find(pool => pool.swap_address.toLowerCase() === address.toLowerCase()),
  )
  return maybe(pool, p =>
    zip(p.underlying_coin_addresses, p.underlying_coins, p.underlying_decimals).map(([address, symbol, decimals]) => ({
      address: getAddress(address),
      symbol,
      decimals,
    })),
  )
}
