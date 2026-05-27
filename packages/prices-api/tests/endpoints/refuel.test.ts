import * as refuel from '../../src/refuel'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getRefuelPoolSeed, nowRange, requestOptions } from '../seeds'

const refuelPoolSeed = endpointSeed(getRefuelPoolSeed)

runEndpointCases('refuel', [
  endpointCase('getRefuelTimeseries', () =>
    refuel.getRefuelTimeseries({ ...refuelPoolSeed(), ...nowRange(), pageSize: 10 }, requestOptions),
  ),
  endpointCase('getRefuelIlTimeseries', () =>
    refuel.getRefuelIlTimeseries({ ...refuelPoolSeed(), ...nowRange() }, requestOptions),
  ),
  endpointCase('getRefuelDonationEvents', () =>
    refuel.getRefuelDonationEvents({ ...refuelPoolSeed(), ...nowRange(), pageSize: 10 }, requestOptions),
  ),
  endpointCase('getRefuelDonationLeaderboard', () =>
    refuel.getRefuelDonationLeaderboard({ ...refuelPoolSeed(), ...nowRange() }, requestOptions),
  ),
  endpointCase('getRefuelChains', () => refuel.getRefuelChains(requestOptions)),
  endpointCase('getRefuelPools', () => refuel.getRefuelPools(refuelPoolSeed().chain, requestOptions)),
  endpointCase('getRefuelDailyDonations', () =>
    refuel.getRefuelDailyDonations({ ...refuelPoolSeed(), ...nowRange() }, requestOptions),
  ),
])
