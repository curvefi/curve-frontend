/**
 * This file is loaded in the global scope before the application is initialized.
 * It listens for EIP-6963 provider announcements and stores them in a global array.
 * This allows wallet providers to announce themselves to the application.
 * The app will assume the detected connectors are available for use.
 */
import type { EIP1193Provider } from 'viem'

/**
 * The detail object for the EIP-6963 provider announcement event.
 * @see https://eips.ethereum.org/EIPS/eip-6963
 */
type Eip6963ProviderDetail = {
  info: { uuid: string; name: string; icon: string; rdns: string }
  provider: EIP1193Provider
}

window.eip6963Connectors = []

/**
 * Global declaration to store EIP-6963 connectors.
 * This allows multiple wallet providers to announce themselves to the application.
 */
window.addEventListener('eip6963:announceProvider', (event) => {
  const { provider, info } = (event as CustomEvent<Eip6963ProviderDetail>).detail
  window.eip6963Connectors = [
    ...window.eip6963Connectors.filter((c) => c.uuid !== info.uuid),
    { id: info.rdns, ...info, provider },
  ]
})

/**
 * Request EIP-6963 providers to announce themselves.
 * This triggers wallet providers to dispatch the 'eip6963:announceProvider' event.
 */
window.dispatchEvent(new Event('eip6963:requestProvider'))
