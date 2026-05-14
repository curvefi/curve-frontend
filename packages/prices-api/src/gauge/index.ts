import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getGauges(options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/dao/gauges/overview`)

  return Schema.getGaugesResponse.parse(resp)
}

export async function getGauge(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/dao/gauges/${gaugeAddress}/metadata`)

  return Schema.getGaugeResponse.parse(resp)
}

export async function getVotes(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/dao/gauges/${gaugeAddress}/votes`)

  return Schema.getVotesResponse.parse(resp)
}

export async function getWeightHistory(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/dao/gauges/${gaugeAddress}/weight_history`)

  return Schema.getWeightHistoryResponse.parse(resp)
}

export async function getDeployment(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/dao/gauges/${gaugeAddress}/deployment`)

  return Schema.getDeploymentResponse.parse(resp)
}

export async function getUserGaugeVotes(user: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/dao/gauges/votes/user/${user}`)

  return Schema.getUserGaugeVotesResponse.parse(resp)
}
