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
import { WalletIcon as DefaultWalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Connector } from '@wagmi/core'
import { useWallet } from '../lib'
import { BINANCE_CONNECTOR_ID, INJECTED_CONNECTOR_ID } from '../lib/wagmi/connectors'

const { IconSize } = SizesAndSpaces

const WALLET_ICONS: Record<string, ReturnType<typeof createSvgIcon>> = {
  injected: BrowserWalletIcon,
  walletConnect: WalletConnectIcon,
  [BINANCE_CONNECTOR_ID]: BinanceWalletIcon,
  coinbaseWalletSDK: CoinbaseWalletIcon,
  safe: SafeWalletIcon,
}

const WALLET_ICON_SIZE = handleBreakpoints({ width: IconSize.xl, height: IconSize.xl })

const WalletIcon = ({ connector }: { connector: Connector }) =>
  ((Icon) =>
    Icon ? (
      <Icon sx={WALLET_ICON_SIZE} />
    ) : connector.icon ? (
      <Box component="img" src={connector.icon} alt={connector.name} sx={{ width: IconSize.xl, height: IconSize.xl }} />
    ) : (
      <DefaultWalletIcon sx={WALLET_ICON_SIZE} />
    ))(WALLET_ICONS[connector.id])

/** Menu item for each wallet type */
const WalletListItem = ({
  connector,
  isLoading,
  onConnect,
}: {
  connector: Connector
  isLoading?: boolean
  onConnect: (connector: Connector) => Promise<void>
}) => (
  <MenuItem
    key={connector.type}
    label={connector.name}
    labelVariant="bodyMBold"
    icon={<WalletIcon connector={connector} />}
    value={connector.id}
    onSelected={() => onConnect(connector)}
    isLoading={isLoading}
  />
)

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
      titleAction={<DefaultWalletIcon />}
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
          // Safe connector only works inside Safe applications, which are loaded in iframes
          .filter(
            (connector) => connector.type !== 'safe' || (typeof window !== 'undefined' && window !== window.parent),
          )
          // TODO: check if we can remove the connector at the connectors.ts level. Hard to test being a geo-blocked dev
          .filter((connector) => connector.id !== BINANCE_CONNECTOR_ID || window.binancew3w?.ethereum)
          // Put EIP-6963 detected connectors on top (they come after the pre-defined connectors)
          .toReversed()
          // Put browser injected wallet first as it's a good fallback that's supposed to work in most cases
          .toSorted((a, b) => (a.id === INJECTED_CONNECTOR_ID ? -1 : b.id === INJECTED_CONNECTOR_ID ? 1 : 0))
          .map((connector) => (
            <WalletListItem
              key={connector.id}
              connector={connector}
              onConnect={onConnect}
              isLoading={connectingToId == connector.id}
            />
          ))}
      </MenuList>
    </ModalDialog>
  )
}
