import type { StellarAddress } from '@/stellar/features/connect-wallet/address'
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit/sdk'
import { activeModule } from '@creit.tech/stellar-wallets-kit/state'
import { type ISupportedWallet, KitEventType } from '@creit.tech/stellar-wallets-kit/types'
import { StrKey } from '@stellar/stellar-sdk'

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
  window.addEventListener('focus', refreshAddress) // some wallets e.g., Freighter don't listen to changes, refresh when returning to the app
  return () => window.removeEventListener('focus', refreshAddress)
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
