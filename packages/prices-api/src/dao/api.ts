import { getHost, type Options } from '..'
import { fetchJson as fetch } from '../fetch'
import { paginate } from '../paginate'
import type * as Responses from './responses'
import * as Parsers from './parsers'

export async function getVotesOverview(options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetVotesOverviewResponse>(`${host}/v1/dao/votes/overview`)

  return resp.data.map(Parsers.parseVotesOverview)
}

export async function getLocksDaily(days: number, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetLocksDailyResponse>(`${host}/v1/dao/locks/daily/${days}`)

  return resp.locks.map(Parsers.parseLocksDaily)
}

export async function getUserLocks(user: string, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetUserLocksResponse>(`${host}/v1/dao/locks/${user}`)

  return resp.locks.map(Parsers.parseUserLock)
}

export async function getLockers(options?: Options) {
  const host = await getHost(options)
  const fs = (page: number) =>
    fetch<Responses.GetLockersResponse>(`${host}v1/dao/lockers?pagination=1000&page=${page}`).then((resp) =>
      resp.users.map(Parsers.parseLockers),
    )

  const lockers = await paginate(fs, 1, 100)

  return lockers
}

export async function getLockersTop(top: number, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetLockersResponse>(`${host}/v1/dao/lockers/${top}`)

  return resp.users.map(Parsers.parseLockers)
}

export async function getSupply(days: number, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetSupplyResponse>(`${host}/v1/dao/supply/${days}`)

  return resp.supply.map(Parsers.parseSupply)
}
