import type { EIP1193Provider } from 'viem'

declare global {
  type Eip6963ProviderInfo = {
    icon: string
    name: string
    rdns: string // reverse DNS
    uuid: string
  }
  type Eip6963Provider = {
    info: Eip6963ProviderInfo
    provider: EIP1193Provider
  }

  type DetectedEip6963Connector = {
    id: string
    name: string
    icon: string
    rdns: string
    uuid: string
    provider: EIP1193Provider
  }

  interface Window {
    clipboardData: DataTransfer | undefined
    ethereum: EIP1193Provider & { eip6963ProviderDetails: Eip6963Provider[] }
    exodus?: EIP1193Provider
    enkrypt?: { providers: { ethereum: EIP1193Provider } }
    binancew3w?: { ethereum?: EIP1193Provider }
    eip6963Connectors: DetectedEip6963Connector[]
  }
}
