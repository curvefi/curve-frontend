import type { Eip1193Provider } from 'ethers'
import { Address } from 'viem'

export type Wallet<TChainId extends number = number> = {
  readonly provider?: Eip1193Provider
  readonly account: { address: Address; ensName?: string }
  readonly chainId: TChainId
}
