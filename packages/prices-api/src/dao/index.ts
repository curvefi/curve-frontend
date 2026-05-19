import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import { paginate } from '../paginate'
import * as Schema from './schema'

export type * from './schema'

export async function getVotesOverview(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/votes/overview`)

  return Schema.getVotesOverviewResponse.parse(response)
}

export async function getLocksDaily(days: number, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/locks/daily/${days}`)

  return Schema.getLocksDailyResponse.parse(response)
}

export async function getUserLocks(user: string, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/locks/${user}`)

  return Schema.getUserLocksResponse.parse(response)
}

export async function getLockers(options?: Options) {
  const host = getHost(options)
  const fs = (page: number) =>
    fetch(`${host}/v1/dao/lockers?pagination=1000&page=${page}`).then(response =>
      Schema.getLockersResponse.parse(response),
    )

  return paginate(fs, 1, 100)
}

export async function getLockersTop(top: number, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/lockers/${top}`)

  return Schema.getLockersTopResponse.parse(response)
}

export async function getSupply(days: number, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/supply/${days}`)

  return Schema.getSupplyResponse.parse(response)
}
