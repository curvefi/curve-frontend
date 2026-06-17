import * as revenue from '../../src/revenue'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getSupportedChainSeed, requestOptions } from '../seeds'

const chainSeed = endpointSeed(getSupportedChainSeed)

runEndpointCases('revenue', [
  endpointCase('getByChain', () => revenue.getByChain(requestOptions)),
  endpointCase('getTopPools', () => revenue.getTopPools(chainSeed(), 10, requestOptions)),
  endpointCase('getCrvUsdWeekly', () => revenue.getCrvUsdWeekly(requestOptions)),
  endpointCase('getPoolsWeekly', () => revenue.getPoolsWeekly(requestOptions)),
  endpointCase('getCushions', () => revenue.getCushions(chainSeed(), requestOptions)),
  endpointCase('getDistributions', () => revenue.getDistributions(100, requestOptions)),
  endpointCase('getCowSwapSettlements', () => revenue.getCowSwapSettlements(undefined, requestOptions)),
  endpointCase('getFeesCollected', () => revenue.getFeesCollected(requestOptions)),
  endpointCase('getFeesStaged', () => revenue.getFeesStaged(requestOptions)),
])
