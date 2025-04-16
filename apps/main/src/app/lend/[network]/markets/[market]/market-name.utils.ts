import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'
import type { LendServerData } from '@/app/api/lend/types'
import { getServerData } from '@/background'
import type { MarketUrlParams } from '@/lend/types/lend.types'

export async function getLendMarketSymbols(
  { market, network }: MarketUrlParams,
  headers: ReadonlyHeaders,
): Promise<[string, string]> {
  const id = market.replace('one-way-market', 'oneway') // API ids are different from those generated in curve-llamalend-js
  const resp = await getServerData<LendServerData>('lend', headers)
  const marketData = resp.lendingVaultData?.find(
    (m) => m.blockchainId == network && (m.id === id || m.controllerAddress === id || m.address == id),
  )
  if (!marketData) {
    const marketKeys = resp.lendingVaultData?.map(({ id, controllerAddress, blockchainId, address }) => ({
      id,
      controllerAddress,
      blockchainId,
      address,
    }))
    console.warn(`Cannot find market ${market} in ${network}. Markets: ${JSON.stringify(marketKeys ?? resp, null, 2)}`)
    return ['', market]
  }
  return [marketData.assets.collateral.symbol, marketData.assets.borrowed.symbol]
}

export async function getBorrowedSymbol(params: MarketUrlParams, headers: ReadonlyHeaders): Promise<string> {
  const [collateral, borrowed] = await getLendMarketSymbols(params, headers)
  return borrowed ?? collateral
}
