import memoizee from 'memoizee'
import { fetchJson } from '@curvefi/prices-api/fetch'

type Asset = { symbol: string }
export type LendingVaultFromApi = {
  id: string
  blockchainId: string
  controllerAddress: string
  assets: { borrowed: Asset; collateral: Asset }
}
type Data = {
  lendingVaultData?: LendingVaultFromApi[]
}

export const getAllLendingVaults = memoizee(
  async () =>
    fetchJson<{ data: { lendingVaultData: LendingVaultFromApi[] } }>(
      `https://api.curve.fi/api/getLendingVaults/all`,
    ).then((r) => r.data.lendingVaultData),
  { maxAge: 5 * 1000 * 60, promise: true, preFetch: true } as const,
)

export const lendServerSideCache: Data = {}
