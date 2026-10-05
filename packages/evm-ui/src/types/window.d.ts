/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { EIP1193Provider } from 'viem'

declare global {
  interface Window {
    clipboardData: DataTransfer | undefined
    ethereum: EIP1193Provider
    exodus?: EIP1193Provider
    enkrypt?: { providers: { ethereum: EIP1193Provider } }
    localStorage: Storage | null // storage can be null on iOS private mode
    CypressNoTestConnector?: string
    CypressTestConnectorChain?: number
  }
}
