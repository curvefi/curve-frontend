import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

export async function getStatistics(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/savings/statistics`)

  return Schema.getStatisticsResponse.parse(response)
}

export async function getEvents(page: number, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/savings/events?page=${page}&per_page=10`)

  return Schema.getEventsResponse.parse(response)
}

export async function getYield(
  aggNumber = 1,
  aggUnit = 'hour',
  startDate?: number,
  endDate?: number,
  options?: Options,
) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 10 })

  const response = await fetch(
    `${host}/v1/crvusd/savings/yield?agg_number=${aggNumber}&agg_units=${aggUnit}&start=${startDate ?? start}&end=${endDate ?? end}`,
  )

  return Schema.getYieldResponse.parse(response)
}

export async function getRevenue(page: number, perPage = 100, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/savings/revenue?page=${page}&per_page=${perPage}`)

  return Schema.getRevenueResponse.parse(response)
}

export async function getUserStats(userAddress: string, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/savings/${userAddress}/stats`)

  return Schema.getUserStatsResponse.parse(response)
}
