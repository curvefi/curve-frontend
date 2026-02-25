import { fetchJson as fetch } from '@curvefi/primitives/fetch.utils'
import { getHost, type Options } from '..'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getGauges(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetGaugesResponse>(`${host}/v1/dao/gauges/overview`)

  return resp.gauges.map(Parsers.parseGauge)
}

export async function getGauge(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetGaugeResponse>(`${host}/v1/dao/gauges/${gaugeAddress}/metadata`)

  return Parsers.parseGauge(resp)
}

export async function getVotes(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetVotesResponse>(`${host}/v1/dao/gauges/${gaugeAddress}/votes`)

  return resp.votes.map(Parsers.parseVote)
}

export async function getWeightHistory(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetWeightHistoryResponse>(`${host}/v1/dao/gauges/${gaugeAddress}/weight_history`)

  return resp.data.map(Parsers.parseWeightHistory)
}

export async function getDeployment(gaugeAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetDeploymentResponse>(`${host}/v1/dao/gauges/${gaugeAddress}/deployment`)

  return Parsers.parseDeployment(resp)
}

export async function getUserGaugeVotes(user: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserGaugeVotesResponse>(`${host}/v1/dao/gauges/votes/user/${user}`)

  return resp.votes.map(Parsers.parseUserGaugeVote)
}
