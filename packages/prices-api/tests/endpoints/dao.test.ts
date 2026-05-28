import * as dao from '../../src/dao'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getDaoUserSeed, requestOptions } from '../seeds'

const daoUserSeed = endpointSeed(getDaoUserSeed)

runEndpointCases('dao', [
  endpointCase('getVotesOverview', () => dao.getVotesOverview(requestOptions)),
  endpointCase('getLocksDaily', () => dao.getLocksDaily(7, requestOptions)),
  endpointCase('getUserLocks', () => dao.getUserLocks(daoUserSeed(), requestOptions)),
  endpointCase('getLockers', () => dao.getLockers(requestOptions)),
  endpointCase('getLockersTop', () => dao.getLockersTop(10, requestOptions)),
  endpointCase('getSupply', () => dao.getSupply(7, requestOptions)),
])
