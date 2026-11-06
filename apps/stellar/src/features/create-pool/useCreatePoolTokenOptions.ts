import { uniqBy } from 'lodash'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { STELLAR_NETWORKS, type StellarNetwork } from '@/stellar/lib/networks'
import { useTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { useTokenSymbol } from '@/stellar/queries/token/token-symbol.query'
import { maybes, notFalsy, notFalsyArray } from '@primitives/objects.utils'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { combineQueryState } from '@ui/features/queries/combine'
import { q } from '@ui/features/queries/util'

export const useCreatePoolTokenOptions = (network: StellarNetwork, search: string) => {
  const pools = useLitePoolList({ chainId: STELLAR_NETWORKS[network].chainId })
  const searchTerm = search.trim()
  const searchedTokenAddress = isContractAddress(searchTerm) ? searchTerm : undefined
  const symbol = useTokenSymbol({ network, token: searchedTokenAddress })
  const decimals = useTokenDecimals({ network, token: searchedTokenAddress })
  const symbolSearch = searchTerm.toLowerCase()
  return q({
    ...combineQueryState(pools, symbol, decimals),
    data: uniqBy(
      notFalsyArray(
        notFalsy(
          maybes([searchedTokenAddress, symbol.data, decimals.data], (address, symbol) => ({
            address: asAddress(address),
            symbol,
            chain: network,
          })),
        ),
        pools.data?.pools.flatMap(pool =>
          notFalsy(
            ...notFalsyArray(pool.coins).map(coin =>
              maybes([coin.address, coin.symbol], (address, symbol) => ({ address, symbol, chain: network })),
            ),
          ),
        ),
      ),
      'address',
    ).filter(token =>
      searchedTokenAddress
        ? token.address === asAddress(searchedTokenAddress)
        : token.symbol.toLowerCase().includes(symbolSearch),
    ),
  })
}
