import * as gauge from '../../src/gauge'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getGaugeSeed, getGaugeVoteSeed, requestOptions } from '../seeds'

const gaugeSeed = endpointSeed(getGaugeSeed)
const gaugeVoteSeed = endpointSeed(getGaugeVoteSeed)

runEndpointCases('gauge', [
  endpointCase('getGauges', () => gauge.getGauges(requestOptions)),
  endpointCase('getGauge', () => gauge.getGauge(gaugeSeed().address, requestOptions)),
  endpointCase('getVotes', () => gauge.getVotes(gaugeVoteSeed().gauge.address, requestOptions)),
  endpointCase('getWeightHistory', () => gauge.getWeightHistory(gaugeSeed().address, requestOptions)),
  endpointCase('getDeployment', () => gauge.getDeployment(gaugeSeed().address, requestOptions)),
  endpointCase('getUserGaugeVotes', () => gauge.getUserGaugeVotes(gaugeVoteSeed().user, requestOptions)),
])
