import type { StellarAddress } from '@/stellar/features/connect-wallet/address'
import { LOBSTR_ID } from '@creit.tech/stellar-wallets-kit/modules/lobstr'
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk'
import { activeModule } from '@creit.tech/stellar-wallets-kit/state'
import { type ISupportedWallet, KitEventType } from '@creit.tech/stellar-wallets-kit/types'
import { type contract, rpc, StrKey } from '@stellar/stellar-sdk'

export type WalletConnector = ISupportedWallet

export const initWallet = (onError: (error: Error) => void) => {
  const modules = defaultModules()
  StellarWalletsKit.init({ modules })
  const refreshAddress = () => activeModule.value && void StellarWalletsKit.fetchAddress().catch(onError)
  modules.forEach(wallet =>
    wallet.onChange?.(
      ({ error }) =>
        activeModule.value === wallet &&
        (error ? onError(new Error(`${error.code}: ${error.message}`)) : refreshAddress()),
    ),
  )
  refreshAddress()

  /**
   * Refresh account changes on focus (e.g. Freighter). LOBSTR 2.1.0 prompts on every getAddress();
   * closing its popup restores focus and repeats the request. Skip it until silent reads are supported;
   * LOBSTR users must reconnect after switching accounts.
   * @see https://github.com/Lobstrco/signer-extension-api/issues/2 (closed but still reproducible in extension 2.1.0)
   */
  const refreshAddressOnFocus = () => activeModule.value?.productId !== LOBSTR_ID && refreshAddress()
  window.addEventListener('focus', refreshAddressOnFocus)
  return () => window.removeEventListener('focus', refreshAddressOnFocus)
}

export const onWalletAddressChanged = (onChange: (address: StellarAddress | undefined) => void) =>
  StellarWalletsKit.on(KitEventType.STATE_UPDATED, ({ payload }) =>
    onChange(payload.address as StellarAddress | undefined),
  )

export const refreshSupportedWallets = () => StellarWalletsKit.refreshSupportedWallets()

export const connectWallet = async (connector: WalletConnector) => {
  StellarWalletsKit.setWallet(connector.id)
  await StellarWalletsKit.fetchAddress()
}

export const disconnectWallet = () => StellarWalletsKit.disconnect()

export const isAccountAddress = (address: string): address is StellarAddress => StrKey.isValidEd25519PublicKey(address)

export const createRpc = ({ rpcUrl, allowHttp }: Pick<contract.ClientOptions, 'rpcUrl' | 'allowHttp'>) =>
  new rpc.Server(rpcUrl, { allowHttp })
