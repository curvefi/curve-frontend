import * as liquidations from '../../src/liquidations'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getCrvUsdMarketSeed, getLlamalendMarketSeed, requestOptions } from '../seeds'

const crvUsdMarketSeed = endpointSeed(getCrvUsdMarketSeed)
const llamalendMarketSeed = endpointSeed(getLlamalendMarketSeed)

runEndpointCases('liquidations', [
  endpointCase('getSoftLiqRatios', 'crvusd', () =>
    liquidations.getSoftLiqRatios(
      'crvusd',
      crvUsdMarketSeed().blockchainId,
      crvUsdMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getSoftLiqRatios', 'lending', () =>
    liquidations.getSoftLiqRatios(
      'lending',
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqsDetailed', 'crvusd', () =>
    liquidations.getLiqsDetailed(
      'crvusd',
      crvUsdMarketSeed().blockchainId,
      crvUsdMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqsDetailed', 'lending', () =>
    liquidations.getLiqsDetailed(
      'lending',
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqsAggregate', 'crvusd', () =>
    liquidations.getLiqsAggregate(
      'crvusd',
      crvUsdMarketSeed().blockchainId,
      crvUsdMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqsAggregate', 'lending', () =>
    liquidations.getLiqsAggregate(
      'lending',
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqOverview', 'crvusd', () =>
    liquidations.getLiqOverview(
      'crvusd',
      crvUsdMarketSeed().blockchainId,
      crvUsdMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqOverview', 'lending', () =>
    liquidations.getLiqOverview(
      'lending',
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqLosses', 'crvusd', () =>
    liquidations.getLiqLosses('crvusd', crvUsdMarketSeed().blockchainId, crvUsdMarketSeed().controller, requestOptions),
  ),
  endpointCase('getLiqLosses', 'lending', () =>
    liquidations.getLiqLosses(
      'lending',
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqHealthDeciles', 'crvusd', () =>
    liquidations.getLiqHealthDeciles(
      'crvusd',
      crvUsdMarketSeed().blockchainId,
      crvUsdMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getLiqHealthDeciles', 'lending', () =>
    liquidations.getLiqHealthDeciles(
      'lending',
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getTotalOverview', 'crvusd', () =>
    liquidations.getTotalOverview({ endpoint: 'crvusd' }, requestOptions),
  ),
  endpointCase('getTotalOverview', 'lending', () =>
    liquidations.getTotalOverview({ endpoint: 'lending' }, requestOptions),
  ),
  endpointCase('getBadDebt', 'crvusd', () => liquidations.getBadDebt({ endpoint: 'crvusd' }, requestOptions)),
  endpointCase('getBadDebt', 'lending', () => liquidations.getBadDebt({ endpoint: 'lending' }, requestOptions)),
])
