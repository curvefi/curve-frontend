import { useCallback, useMemo, useState } from 'react'
import type { BaseError } from 'viem'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import MenuList from '@mui/material/MenuList'
import { createSvgIcon } from '@mui/material/utils'
import { toArray } from '@primitives/array.utils'
import { t } from '@ui-kit/lib/i18n'
import { BrowserWalletIcon } from '@ui-kit/shared/icons/BrowserWalletIcon'
import { CoinbaseWalletIcon } from '@ui-kit/shared/icons/CoinbaseWalletIcon'
import { MetamaskWalletIcon } from '@ui-kit/shared/icons/MetamaskWalletIcon'
import { SafeWalletIcon } from '@ui-kit/shared/icons/SafeWalletIcon'
import { WalletConnectIcon } from '@ui-kit/shared/icons/WalletConnectIcon'
import { WalletIcon as DefaultWalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Connector } from '@wagmi/core'
import { useWallet } from '../lib'
import { INJECTED_CONNECTOR_ID } from '../lib/wagmi/connectors'

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

const WalletIcon = ({ connector }: { connector: Connector }) =>
  (Icon =>
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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
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
  const isSafeApp = typeof window !== 'undefined' && window !== window.parent

  const visibleConnectors = useMemo(
    () =>
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
    [connectors, isSafeApp],
  )

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
        {visibleConnectors.map(connector => (
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
