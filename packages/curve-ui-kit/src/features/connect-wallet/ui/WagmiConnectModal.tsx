import { ReactNode, useCallback, useMemo, useState } from 'react'
import type { BaseError } from 'viem'
import { useConnectors } from 'wagmi'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { BINANCE_CONNECTOR } from '@ui-kit/features/connect-wallet/lib/wagmi/connectors'
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
import { useWallet } from '../lib'

const { IconSize } = SizesAndSpaces

/**
 * The Safe connector only works inside the Safe application, where the Curve app is loaded in an iframe.
 * Trying to use the Safe connector outside the iframe will result in an error.
 */
const isInIframe = typeof window !== 'undefined' && window !== window.parent

const walletsIcons = {
  injected: BrowserWalletIcon,
  walletConnect: WalletConnectIcon,
  [BINANCE_CONNECTOR]: BinanceWalletIcon,
  coinbaseWalletSDK: CoinbaseWalletIcon,
  safe: SafeWalletIcon,
}

/**
 * Menu item for each wallet type. Only needed so we can useCallback
 */
const WalletListItem = ({
  label,
  icon,
  connector,
  onConnect,
  isLoading,
}: {
  label: string
  icon: ReactNode
  connector: string
  onConnect: (connector: string) => Promise<void>
  isLoading?: boolean
}) => {
  const handleConnect = useCallback(() => onConnect(connector), [connector, onConnect])
  return (
    <MenuItem
      key={label}
      label={label}
      labelVariant="bodyMBold"
      icon={icon}
      value={label}
      onSelected={handleConnect}
      isLoading={isLoading}
    />
  )
}

const iconSx = handleBreakpoints({ width: IconSize.xl, height: IconSize.xl })

const getWalletItems = (connectors: ReturnType<typeof useConnectors>) =>
  connectors
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .filter(({ id }) => id != 'safe' || isInIframe)
    .map(({ icon, id, name }) => {
      const Icon = walletsIcons[id as keyof typeof walletsIcons]
      return {
        label: name.replace(/\s*Injected$/, '') || t`Browser Wallet`,
        connector: id,
        icon: Icon ? (
          <Icon sx={iconSx} />
        ) : icon ? (
          <Box component="img" src={icon} alt={name} sx={iconSx} />
        ) : (
          <WalletIcon sx={iconSx} />
        ),
      }
    })

/**
 * Display a list of wallets to choose from, connecting to the selected one.
 * Use global state retrieved from the useWallet hook to determine if the modal is open.
 */
export const WagmiConnectModal = () => {
  const { connect, showModal, closeModal } = useWallet()
  const connectors = useConnectors()
  const [error, setError] = useState<unknown>(null)
  const [isConnectingType, setIsConnectingType] = useState<string | null>(null)

  const onConnect = useCallback(
    async (connector: string) => {
      setError(null)
      try {
        setIsConnectingType(connector)
        await connect(connector)
      } catch (e) {
        console.info(e) // e.g. user rejected
        setError(e)
      } finally {
        setIsConnectingType(null)
      }
    },
    [connect],
  )

  const walletItems = useMemo(() => getWalletItems(connectors), [connectors])
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
        ...(isConnectingType === 'walletConnect' && { display: 'none' }),
      }}
    >
      {error ? (
        <Alert variant="filled" severity="error">
          <AlertTitle>{t`Error connecting wallet`}</AlertTitle>
          {(error as BaseError).shortMessage ?? (error as Error).message ?? (error as string)}
        </Alert>
      ) : null}
      <MenuList>
        {walletItems.map((wallet) => (
          <WalletListItem
            key={wallet.connector}
            {...wallet}
            onConnect={onConnect}
            isLoading={isConnectingType === wallet.connector}
          />
        ))}
      </MenuList>
    </ModalDialog>
  )
}
