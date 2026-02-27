import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getStatistics(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetStatisticsResponse>(`${host}/v1/crvusd/savings/statistics`)

  return Parsers.parseStatistics(resp)
}

export async function getEvents(page: number, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetEventsResponse>(`${host}/v1/crvusd/savings/events?page=${page}&per_page=10`)

  return { count: resp.count, events: resp.events.map(Parsers.parseEvent) }
}

export async function getYield(
  aggNumber: number = 1,
  aggUnit: string = 'hour',
  startDate?: number,
  endDate?: number,
  options?: Options,
) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 10 })

  const resp = await fetch<Responses.GetYieldResponse>(
    `${host}/v1/crvusd/savings/yield?agg_number=${aggNumber}&agg_units=${aggUnit}&start=${startDate ?? start}&end=${endDate ?? end}`,
  )

  return resp.data.map(Parsers.parseYield)
}

export async function getRevenue(page: number, perPage: number = 100, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetRevenueResponse>(
    `${host}/v1/crvusd/savings/revenue?page=${page}&per_page=${perPage}`,
  )

  return { totalDistributed: resp.total_distributed, history: resp.history.map(Parsers.parseRevenue) }
}

export async function getUserStats(userAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserStatsResponse>(`${host}/v1/crvusd/savings/${userAddress}/stats`)

  return Parsers.parseUserStats(resp)
}
