'use server'
import { lendServerSideCache } from '@/app/lend/server-side.data'
import type { MarketUrlParams } from '@/lend/types/lend.types'

export async function getLendMarketSymbols({ market, network }: MarketUrlParams): Promise<[string, string]> {
  const marketData = lendServerSideCache.lendingVaultData?.find(
    (m) => m.blockchainId == network && (m.id === id || m.controllerAddress === id),
  )

  const id = market.replace('one-way-market', 'oneway') // API ids are different from those generated in curve-lending-js
  if (!marketData) {
    const marketKeys = lendServerSideCache.lendingVaultData
      ?.filter((m) => m.blockchainId == network)
      ?.map(({ id, controllerAddress }) => ({ id, controllerAddress }))
    console.warn(`Cannot find market ${market} in ${network}. Markets: ${JSON.stringify(marketKeys, null, 2)}`)
    return ['', market]
  }
  return [marketData.assets.collateral.symbol, marketData.assets.borrowed.symbol]
}

export async function getBorrowedSymbol(params: MarketUrlParams): Promise<string> {
  const [collateral, borrowed] = await getLendMarketSymbols(params)
  return borrowed ?? collateral
}
