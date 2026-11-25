import * as tokens from '../../src/tokens'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getPoolSeed, requestOptions } from '../seeds'

const poolSeed = endpointSeed(getPoolSeed)

runEndpointCases('tokens', [
  endpointCase('getToken', () => tokens.getToken(poolSeed().blockchainId, poolSeed().mainToken, requestOptions)),
])
