import * as crvusd from '../../src/crvusd'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getCrvUsdMarketSeed, getCrvUsdUserSeed, getSupportedChainSeed, requestOptions } from '../seeds'

const chainSeed = endpointSeed(getSupportedChainSeed)
const crvUsdMarketSeed = endpointSeed(getCrvUsdMarketSeed)
const crvUsdUserSeed = endpointSeed(getCrvUsdUserSeed)

runEndpointCases('crvusd', [
  endpointCase('getMarkets', () => crvusd.getMarkets(chainSeed(), { page: 1, per_page: 50 }, requestOptions)),
  endpointCase('getAllMarkets', () => crvusd.getAllMarkets({ page: 1, per_page: 50 }, requestOptions)),
  endpointCase('getSnapshots', () =>
    crvusd.getSnapshots(
      crvUsdMarketSeed().chain,
      crvUsdMarketSeed().controller,
      { agg: 'day', fetch_on_chain: true, limit: 10 },
      requestOptions,
    ),
  ),
  endpointCase('getCrvUsdSupply', () => crvusd.getCrvUsdSupply(chainSeed(), 7, requestOptions)),
  endpointCase('getKeepers', () => crvusd.getKeepers(chainSeed(), requestOptions)),
  endpointCase('getUserMarkets', () =>
    crvusd.getUserMarkets(crvUsdUserSeed().user, crvUsdUserSeed().chain, requestOptions),
  ),
  endpointCase('getAllUserMarkets', () => crvusd.getAllUserMarkets(crvUsdUserSeed().user, undefined, requestOptions)),
  endpointCase('getUserMarketStats', () =>
    crvusd.getUserMarketStats(
      crvUsdUserSeed().user,
      crvUsdUserSeed().chain,
      crvUsdUserSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getUserMarketSnapshots', () =>
    crvusd.getUserMarketSnapshots(
      crvUsdUserSeed().user,
      crvUsdUserSeed().chain,
      crvUsdUserSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getUserMarketCollateralEvents', () =>
    crvusd.getUserMarketCollateralEvents(
      crvUsdUserSeed().user,
      crvUsdUserSeed().chain,
      crvUsdUserSeed().controller,
      undefined,
      requestOptions,
    ),
  ),
  endpointCase('getCrvUsdTvl', () => crvusd.getCrvUsdTvl(chainSeed(), requestOptions)),
])
