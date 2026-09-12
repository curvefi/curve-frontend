import { once } from 'lodash'
import type { StellarAddress } from '@/features/connect-wallet/address'
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils'
// eslint-disable-next-line no-restricted-imports -- This module wraps direct wallet SDK access.
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk'
import { KitEventType, type ISupportedWallet } from '@creit-tech/stellar-wallets-kit/types'

export type WalletConnector = ISupportedWallet

export const initWallet = once(() => StellarWalletsKit.init({ modules: defaultModules() }))

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
