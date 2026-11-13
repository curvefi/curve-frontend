import { groupBy, keyBy, mapValues, orderBy, sumBy, uniqBy } from 'lodash'
import {
  asAddress,
  asStellarContract,
  type StellarAddress,
  type StellarContract,
} from '@/stellar/features/connect-wallet/address'
import { useAccountTokens } from '@/stellar/features/connect-wallet/stellar-wallet-kit/account'
import { isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { STELLAR_NETWORKS, type StellarNetwork } from '@/stellar/lib/networks'
import { getTokenBalanceQueryOptions } from '@/stellar/queries/token/token-balance.query'
import { getTokenDecimalsQueryOptions, useTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { useTokenSymbol } from '@/stellar/queries/token/token-symbol.query'
import { useTokenUsdRates } from '@/stellar/queries/token/token-usd-rate.query'
import { zip } from '@primitives/array.utils'
import { fromEntries, maybes, notFalsy, notFalsyArray } from '@primitives/objects.utils'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { combineQueries, combineQueryState } from '@ui/features/queries/combine'
import { useQueries } from '@ui/features/queries/query-hooks'
import { q } from '@ui/features/queries/util'

const useContractTokenBalances = (
  network: StellarNetwork,
  account: StellarAddress | undefined,
  tokens: StellarContract[],
) => {
  const decimals = useQueries({
    queries: tokens.map(token => getTokenDecimalsQueryOptions({ network, token }, !!account)),
  })
  const balances = useQueries({
    queries: zip(tokens, decimals).map(([token, decimals]) =>
      getTokenBalanceQueryOptions({ network, account, token, decimals: decimals.data }),
    ),
  })
  return fromEntries(
    zip(tokens, decimals, balances).map(([token, decimals, balance]) => [
      token,
      combineQueries([balance, decimals], balance => balance),
    ]),
  )
}

/**
 * 1. Merge pool tokens, wallet assets (including zero balances), and the searched contract; deduplicate by address.
 * 2. Sum each token's pool TVL and reuse Horizon balances; fetch decimals and balances for remaining contracts.
 * 3. Fetch USD prices only for tokens with positive balances.
 * 4. Sort by USD balance, raw balance, and TVL descending, then symbol ascending; apply the search filter last.
 */
export const useCreatePoolTokenOptions = (
  network: StellarNetwork,
  search: string,
  account: StellarAddress | undefined,
) => {
  const pools = useLitePoolList({ chainId: STELLAR_NETWORKS[network].chainId })
  const walletTokens = useAccountTokens({ network, account })
  const walletTokensByAddress = keyBy(walletTokens.data, 'address')
  const searchTerm = search.trim()
  const searchedTokenAddress = isContractAddress(searchTerm) ? searchTerm : undefined
  const symbol = useTokenSymbol({ network, token: searchedTokenAddress })
  const decimals = useTokenDecimals({ network, token: searchedTokenAddress })
  const poolTokens = pools.data?.pools.flatMap(pool =>
    notFalsy(
      ...notFalsyArray(pool.coins).map(coin =>
        maybes([coin.address, coin.symbol], (address, symbol) => ({ address, symbol, chain: network, tvl: pool.tvl })),
      ),
    ),
  )
  const tokenTvl = mapValues(groupBy(poolTokens, 'address'), tokens => sumBy(tokens, 'tvl'))
  const tokens = uniqBy(
    notFalsyArray(
      notFalsy(
        maybes([searchedTokenAddress, symbol.data, decimals.data], (address, symbol) => ({
          address: asAddress(address),
          symbol,
          chain: network,
        })),
      ),
      walletTokens.data,
      poolTokens,
    ),
    'address',
  )
  // Resolve wallet discovery first, so even zero trustline balances avoid a contract read.
  const balances = useContractTokenBalances(
    network,
    account,
    walletTokens.isLoading
      ? []
      : tokens
          .filter(({ address }) => !walletTokensByAddress[address])
          .map(({ address }) => asStellarContract(address)),
  )
  const tokensWithBalances = tokens.map(token => ({
    ...token,
    balance: walletTokensByAddress[token.address]?.balance ?? balances[asStellarContract(token.address)]?.data,
    tvl: tokenTvl[token.address] ?? 0,
  }))
  const prices = useTokenUsdRates({
    network,
    tokenAddresses: tokensWithBalances
      .filter(token => +(token.balance ?? 0) > 0)
      .map(token => asStellarContract(token.address)),
  })
  const tokensWithPrices = tokensWithBalances.map(token => {
    const tokenPrice = prices[asStellarContract(token.address)]?.data
    return { ...token, tokenPrice, balanceUsd: +(token.balance ?? 0) * (tokenPrice ?? 0) }
  })
  return q({
    ...combineQueryState(pools, walletTokens, symbol, decimals),
    data: orderBy(
      tokensWithPrices,
      ['balanceUsd', t => +(t.balance ?? 0), 'tvl', 'symbol'],
      ['desc', 'desc', 'desc', 'asc'],
    ).filter(token =>
      searchedTokenAddress
        ? token.address === asAddress(searchedTokenAddress)
        : token.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  })
}
