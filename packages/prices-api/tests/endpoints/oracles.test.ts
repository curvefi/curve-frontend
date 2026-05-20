import * as oracles from '../../src/oracles'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { requestOptions } from '../seeds'

runEndpointCases('oracles', [endpointCase('getOracles', () => oracles.getOracles(requestOptions))])
