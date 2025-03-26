type Asset = { symbol: string }
export type LendingVaultFromApi = {
  id: string
  blockchainId: string
  controllerAddress: string
  assets: { borrowed: Asset; collateral: Asset }
  address: string
}
export type LendServerData = {
  lendingVaultData?: LendingVaultFromApi[]
}
