import { useCallback, useState } from 'react'
import type { BaseError } from 'viem'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { createSvgIcon } from '@mui/material/utils'
import { t } from '@ui-kit/lib/i18n'
import { BinanceWalletIcon } from '@ui-kit/shared/icons/BinanceWalletIcon'
import { BrowserWalletIcon } from '@ui-kit/shared/icons/BrowserWalletIcon'
import { CoinbaseWalletIcon } from '@ui-kit/shared/icons/CoinbaseWalletIcon'
import { SafeWalletIcon } from '@ui-kit/shared/icons/SafeWalletIcon'
import { WalletConnectIcon } from '@ui-kit/shared/icons/WalletConnectIcon'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Connector } from '@wagmi/core'
import { useWallet } from '../lib'
import type { CONNECTOR_IDS } from '../lib/wagmi/connectors'

const { IconSize } = SizesAndSpaces

/**
 * The Safe connector only works inside the Safe application, where the Curve app is loaded in an iframe.
 * Trying to use the Safe connector outside the iframe will result in an error.
 */
const isInIframe = typeof window !== 'undefined' && window !== window.parent

type ConnectorInfo = {
  label: string
  icon: ReturnType<typeof createSvgIcon>
}

const CONNECTOR_INFO = {
  injected: { label: `Browser Wallet`, icon: BrowserWalletIcon },
  walletConnect: { label: `Wallet Connect`, icon: WalletConnectIcon },
  'wallet.binance.com': { label: `Binance Wallet`, icon: BinanceWalletIcon },
  coinbaseWalletSDK: { label: `Coinbase`, icon: CoinbaseWalletIcon },
  safe: { label: 'Safe', icon: SafeWalletIcon },
} satisfies Record<(typeof CONNECTOR_IDS)[number], ConnectorInfo>

/** Menu item for each wallet type. Only needed so we can useCallback */
const WalletListItem = ({
  connector,
  isLoading,
  isDisabled,
  onConnect,
}: {
  connector: Connector
  isLoading?: boolean
  isDisabled?: boolean
  onConnect: (connector: Connector) => Promise<void>
}) => {
  const connectorId = connector.id as keyof typeof CONNECTOR_INFO
  const { label = connector.name, icon: ConnectorIcon } = CONNECTOR_INFO[connectorId] ?? {}
  const iconSize = handleBreakpoints({ width: IconSize.xl, height: IconSize.xl })

  const handleSelect = useCallback(() => onConnect(connector), [onConnect, connector])

  const icon = ConnectorIcon ? (
    <ConnectorIcon sx={iconSize} />
  ) : connector.icon ? (
    <Box component="img" src={connector.icon} alt={label} sx={{ width: IconSize.xl, height: IconSize.xl }} />
  ) : (
    <WalletIcon sx={iconSize} />
  )

  return (
    <MenuItem
      key={connector.type}
      label={label}
      labelVariant="bodyMBold"
      icon={icon}
      value={connector.id}
      onSelected={handleSelect}
      isLoading={isLoading}
      disabled={isDisabled && !isLoading}
    />
  )
}

/**
 * Display a list of wallets to choose from, connecting to the selected one.
 * Use global state retrieved from the useWallet hook to determine if the modal is open.
 */
export const WagmiConnectModal = () => {
  const { connectors, connect, showModal, closeModal } = useWallet()
  const [error, setError] = useState<unknown>(null)
  const [connectingToId, setConnectingToId] = useState<string | null>(null)

  const onConnect = useCallback(
    async (connector: Connector) => {
      setError(null)
      try {
        setConnectingToId(connector.id)
        await connect(connector)
      } catch (e) {
        console.info(e) // e.g. user rejected
        setError(e)
      } finally {
        setConnectingToId(null)
      }
    },
    [connect],
  )

  return (
    <ModalDialog
      open={showModal}
      onClose={closeModal}
      title={t`Connect Wallet`}
      titleAction={<WalletIcon />}
      compact
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
        ...(connectingToId === 'walletConnect' && { display: 'none' }),
      }}
    >
      {error ? (
        <Alert variant="filled" severity="error">
          <AlertTitle>{t`Error connecting wallet`}</AlertTitle>
          {(error as BaseError).shortMessage ?? (error as Error).message ?? (error as string)}
        </Alert>
      ) : null}
      <MenuList>
        {connectors
          .filter((connector) => connector.type !== 'safe' || isInIframe)
          .map((connector) => (
            <WalletListItem
              key={connector.id}
              connector={connector}
              onConnect={onConnect}
              isLoading={connectingToId == connector.id}
              isDisabled={!!connectingToId}
            />
          ))}
      </MenuList>
    </ModalDialog>
  )
}
