import type { Eip1193Provider } from '@web3-onboard/core'

declare global {
  type Eip6963ProviderInfo = {
    icon: string
    name: string
    rdns: string // reverse DNS
    uuid: string
  }
  type Eip6963Provider = {
    info: Eip6963ProviderInfo
    provider: Eip1193Provider
  }

  interface Window {
    clipboardData: any
    ethereum: Eip1193Provider & { eip6963ProviderDetails: Eip6963Provider[] }
    exodus?: Eip1193Provider
    enkrypt?: { providers: { ethereum: Eip1193Provider } }
  }
}
