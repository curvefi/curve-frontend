export interface CurrencyReservesProps {
  cr: CurrencyReservesToken | undefined
  haveSameTokenName: boolean
  network: NetworkConfig
  rChainId: ChainId
  token: string
  tokenAddress: string
  tokenLink: string | undefined
  tokensMapper: TokensMapper
  handleCopyClick(address: string): void
}
