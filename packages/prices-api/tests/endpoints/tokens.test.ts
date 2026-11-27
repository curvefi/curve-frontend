import * as tokens from '../../src/tokens'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getPoolSeed, requestOptions } from '../seeds'

const poolSeed = endpointSeed(getPoolSeed)

runEndpointCases('tokens', [
  endpointCase('getToken', 'coin', () =>
    tokens.getToken(poolSeed().blockchainId, poolSeed().mainToken, requestOptions),
  ),
  endpointCase('getToken', 'LP token', () =>
    tokens.getToken(poolSeed().blockchainId, poolSeed().lpToken, requestOptions),
  ),
])
