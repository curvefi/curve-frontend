'use server'
import memoizee from 'memoizee'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import type { Chain } from '@curvefi/prices-api'
import { fetchJson } from '@curvefi/prices-api/fetch'

const options = { maxAge: 5 * 1000 * 60, promise: true, preFetch: true } as const

type Asset = { symbol: string }
type Data = { lendingVaultData: { id: string; ammAddress: string; assets: { borrowed: Asset; collateral: Asset } }[] }

const getAllMarkets = memoizee(
  async (network: string) => fetchJson<{ data: Data }>(`https://api.curve.fi/api/getLendingVaults/${network}/oneway`),
  options,
)

export async function getLendMarketSymbols({ market, network }: MarketUrlParams): Promise<[string, string]> {
  const {
    data: { lendingVaultData },
  } = await getAllMarkets(network as Chain)

  const id = market.replace('one-way-market', 'oneway') // API ids are different then those generated in curve-lending-js
  const marketData = lendingVaultData.find((m) => m.id === id || m.ammAddress === id)
  if (!marketData) {
    console.warn(`Cannot find market ${market} in ${network}. Markets: ${JSON.stringify(lendingVaultData, null, 2)}`)
    return ['', market]
  }
  return [marketData.assets.collateral.symbol, marketData.assets.borrowed.symbol]
}

export async function getBorrowedSymbol(params: MarketUrlParams): Promise<string> {
  const [collateral, borrowed] = await getLendMarketSymbols(params)
  return borrowed ?? collateral
}
