import * as chains from '../../src/chains'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getSupportedChainSeed, requestOptions } from '../seeds'

const chainSeed = endpointSeed(getSupportedChainSeed)

runEndpointCases('chains', [
  endpointCase('getSupportedChains', () => chains.getSupportedChains(requestOptions)),
  endpointCase('getChainInfo', () => chains.getChainInfo(chainSeed(), requestOptions)),
  endpointCase('getTxs', () => chains.getTxs(requestOptions)),
  endpointCase('getUsers', () => chains.getUsers(requestOptions)),
  endpointCase('getPoolFilters', () => chains.getPoolFilters(requestOptions)),
])
