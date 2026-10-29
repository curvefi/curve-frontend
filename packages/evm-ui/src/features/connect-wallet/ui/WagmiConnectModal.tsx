import { useCallback, useMemo, useRef, useState } from 'react'
import type { BaseError } from 'viem'
import Box from '@mui/material/Box'
import { createSvgIcon } from '@mui/material/utils'
import { toArray } from '@primitives/array.utils'
import { ConnectWalletModal } from '@ui/features/connect-wallet/ConnectWalletModal'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { BrowserWalletIcon } from '@ui/icons/BrowserWalletIcon'
import { CoinbaseWalletIcon } from '@ui/icons/CoinbaseWalletIcon'
import { MetamaskWalletIcon } from '@ui/icons/MetamaskWalletIcon'
import { SafeWalletIcon } from '@ui/icons/SafeWalletIcon'
import { WalletConnectIcon } from '@ui/icons/WalletConnectIcon'
import { WalletIcon as DefaultWalletIcon } from '@ui/icons/WalletIcon'
import type { Connector } from '@wagmi/core'
import { useWallet } from '../lib/useWallet'
import { INJECTED_CONNECTOR_ID } from '../lib/wagmi/connectors'
import { OATH_WALLET_ID, getWalletChoices, connectOathWallet, type WalletChoice } from '../lib/wagmi/oathWallet'

const { IconSize } = SizesAndSpaces

const WALLET_ICONS: Record<string, ReturnType<typeof createSvgIcon>> = {
  injected: BrowserWalletIcon,
  walletConnect: WalletConnectIcon,
  coinbaseWalletSDK: CoinbaseWalletIcon,
  safe: SafeWalletIcon,
  metaMaskSDK: MetamaskWalletIcon,
}

const WALLET_ICON_SIZE = handleBreakpoints({ width: IconSize.xl, height: IconSize.xl })

/** The same wallet can have different IDs for its normal connector and the EIP-6963 instances, so we include rDNS as a good additional candidate */
const getConnectorWalletIds = (connector: Connector) => [connector.id, ...toArray(connector.rdns)]

const WalletIcon = ({ connector }: { connector: WalletChoice }) =>
  (Icon =>
    Icon ? (
      <Icon sx={WALLET_ICON_SIZE} />
    ) : connector.icon ? (
      <Box component="img" src={connector.icon} alt={connector.name} sx={{ width: IconSize.xl, height: IconSize.xl }} />
    ) : (
      <DefaultWalletIcon sx={WALLET_ICON_SIZE} />
    ))(WALLET_ICONS[connector.id])

/**
 * Display a list of wallets to choose from, connecting to the selected one.
 * Use global state retrieved from the useWallet hook to determine if the modal is open.
 */
export const WagmiConnectModal = () => {
  const { connectors, connect, disconnect, showModal, closeModal } = useWallet()
  const [error, setError] = useState<Error | null>(null)
  const [connectingToId, setConnectingToId] = useState<string | null>(null)
  const connectionPendingRef = useRef(false)
  const isSafeApp = typeof window !== 'undefined' && window !== window.parent

  const visibleConnectors = useMemo(
    () =>
      getWalletChoices(
        connectors
          // Safe connector only works inside Safe applications, which are loaded in iframes
          .filter(connector => connector.type !== 'safe' || isSafeApp)
          // Put EIP-6963 detected connectors on top (they come after the pre-defined connectors)
          .toReversed()
          // Put browser injected wallet first as it's a good fallback that's supposed to work in most cases
          .toSorted((a, b) => (a.id === INJECTED_CONNECTOR_ID ? -1 : b.id === INJECTED_CONNECTOR_ID ? 1 : 0))
          // Remove EIP-6963 dupes if there's already a connector manually added
          // Keep the last duplicate so manual connectors win after EIP-6963 connectors are moved to the top.
          .filter(
            (connector, index, connectors) =>
              connectors.findLastIndex(other =>
                getConnectorWalletIds(connector).some(id => getConnectorWalletIds(other).includes(id)),
              ) === index,
          ),
      ),
    [connectors, isSafeApp],
  )

  const onConnect = useCallback(
    async (choice: WalletChoice) => {
      if (connectionPendingRef.current) return
      connectionPendingRef.current = true
      setError(null)
      try {
        setConnectingToId(choice.id)
        if (choice.id === OATH_WALLET_ID) {
          await connectOathWallet(choice.connector, disconnect, () => connect(choice.connector))
        } else {
          await connect(choice.connector)
        }
      } catch (e) {
        console.info(e) // e.g. user rejected
        if (e instanceof Error) {
          const error = new Error((e as BaseError).shortMessage ?? e.message, { cause: e })
          error.stack = e.stack
          setError(error)
        } else {
          setError(new Error(getErrorMessage(e, String(e)), { cause: e }))
        }
      } finally {
        connectionPendingRef.current = false
        setConnectingToId(null)
      }
    },
    [connect, disconnect],
  )
  return (
    <ConnectWalletModal
      connectingToId={connectingToId}
      onConnect={onConnect}
      WalletIcon={WalletIcon}
      error={error}
      closeModal={closeModal}
      showModal={showModal}
      visibleConnectors={visibleConnectors}
      sx={{
        /*
        When connecting with WalletConnect, we hide this dialog because the MUI Dialog
        component adds a tabIndex of -1 to its container. This prevents text input in
        the "Search wallet" field of the WC modal — it's not a z-index issue, but
        caused by the tabIndex itself.

        Although MUI provides a slotProp for the container, the tabIndex is still set
        to -1 internally, regardless of what you specify. Other slotProps work fine,
        so this behavior seems hardcoded in MUI.

        The most reliable fix is to skip rendering this modal while WalletConnect
        is connecting, rather than patching the tabIndex via a flaky JavaScript hack.
      */
        ...((connectingToId === 'walletConnect' || connectingToId === OATH_WALLET_ID) && { display: 'none' }),
      }}
    />
  )
}
