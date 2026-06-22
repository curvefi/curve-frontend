import * as pools from '../../src/pools'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getPoolSeed, getSupportedChainSeed, nowRange, requestOptions } from '../seeds'

const chainSeed = endpointSeed(getSupportedChainSeed)
const poolSeed = endpointSeed(getPoolSeed)

runEndpointCases('pools', [
  endpointCase('getPools', () => pools.getPools(chainSeed(), requestOptions)),
  endpointCase('getPool', () => pools.getPool(poolSeed().chain, poolSeed().poolAddress, requestOptions)),
  endpointCase('listPoolChains', () => pools.listPoolChains(requestOptions)),
  endpointCase('listPools', () => pools.listPools({ chainId: 1, pagination: 2 }, requestOptions)),
  endpointCase('listPoolRegistries', () => pools.listPoolRegistries({ chainId: 1 }, requestOptions)),
  endpointCase('getVolume', () => pools.getVolume(poolSeed().chain, poolSeed().poolAddress, requestOptions)),
  endpointCase('getTvl', () => pools.getTvl(poolSeed().chain, poolSeed().poolAddress, requestOptions)),
  endpointCase('getPoolTrades', () => pools.getPoolTrades({ ...poolSeed(), page: 1, perPage: 10 }, requestOptions)),
  endpointCase('getAllPoolTrades', () => pools.getAllPoolTrades({ ...poolSeed(), perPage: 10 }, requestOptions)),
  endpointCase('getPoolLiquidityEvents', () =>
    pools.getPoolLiquidityEvents({ ...poolSeed(), perPage: 10 }, requestOptions),
  ),
  endpointCase('getPoolMetadata', () => pools.getPoolMetadata(poolSeed(), requestOptions)),
  endpointCase('getPoolSnapshots', () => pools.getPoolSnapshots({ ...poolSeed(), ...nowRange() }, requestOptions)),
])
