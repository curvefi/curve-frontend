import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { refreshDataInBackground } from '@/background'
import { fetchAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { getAllMarkets } from '@curvefi/prices-api/crvusd'
import { recordValues } from '@curvefi/prices-api/objects.util'

const CrvUsdServerSideCache: CrvUsdServerData = {}

const getCrvUsdServerSideData = async () => {
  const [markets, dailyVolume] = await Promise.all([getAllMarkets(), fetchAppStatsDailyVolume({})])
  CrvUsdServerSideCache.mintMarkets = recordValues(markets).flat()
  CrvUsdServerSideCache.dailyVolume = dailyVolume
}

refreshDataInBackground('CrvUsd', getCrvUsdServerSideData).catch(console.error)

export const dynamic = 'force-dynamic' // don't cache this route on the front-end, we are caching it on the server-side
export const revalidate = 60 // same as refreshDataInBackground, but cannot use variable here
export const GET = async () => Response.json(CrvUsdServerSideCache)
