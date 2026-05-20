import * as savings from '../../src/savings'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getSavingsUserSeed, requestOptions } from '../seeds'

const savingsUserSeed = endpointSeed(getSavingsUserSeed)

runEndpointCases('savings', [
  endpointCase('getStatistics', () => savings.getStatistics(requestOptions)),
  endpointCase('getEvents', () => savings.getEvents(1, requestOptions)),
  endpointCase('getYield', () => savings.getYield(1, 'hour', undefined, undefined, requestOptions)),
  endpointCase('getRevenue', () => savings.getRevenue(1, 10, requestOptions)),
  endpointCase('getUserStats', () => savings.getUserStats(savingsUserSeed(), requestOptions)),
])
