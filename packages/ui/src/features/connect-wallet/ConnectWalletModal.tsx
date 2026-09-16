import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import MenuList from '@mui/material/MenuList'
import { MenuItem } from '@ui/components/MenuItem'
import { ModalDialog } from '@ui/components/ModalDialog'
import { WalletIcon as DefaultWalletIcon } from '@ui/icons/WalletIcon'
import { t } from '@ui/lib/i18n'
import type { SxProps } from '@ui/lib/mui'

type WalletConnector = { id: string; name: string; loading?: boolean }

/** Menu item for each wallet type */
const WalletListItem = <T extends WalletConnector>({
  connector,
  isLoading,
  onConnect,
  WalletIcon,
}: {
  connector: T
  isLoading?: boolean
  onConnect: (connector: T) => Promise<void>
  WalletIcon: ({ connector }: { connector: T }) => ReactNode
}) => (
  <MenuItem
    key={connector.id}
    label={connector.name}
    labelVariant="bodyMBold"
    icon={<WalletIcon connector={connector} />}
    value={connector.id}
    onSelected={() => void onConnect(connector)}
    isLoading={isLoading}
  />
)

export const ConnectWalletModal = <T extends WalletConnector>({
  error,
  showModal,
  closeModal,
  sx,
  visibleConnectors,
  onConnect,
  connectingToId,
  WalletIcon,
}: {
  error: Error | null | undefined
  showModal: boolean
  closeModal: () => void
  sx?: SxProps
  visibleConnectors: T[]
  onConnect: (connector: T) => Promise<void>
  connectingToId: string | null
  WalletIcon: ({ connector }: { connector: T }) => ReactNode
}) => (
  <ModalDialog
    open={showModal}
    onClose={closeModal}
    title={t`Connect Wallet`}
    titleAction={<DefaultWalletIcon />}
    compact
    sx={sx}
  >
    {error && (
      <Alert variant="filled" severity="error">
        <AlertTitle>{t`Error connecting wallet`}</AlertTitle>
        {error.message}
      </Alert>
    )}
    <MenuList>
      {visibleConnectors.map(connector => (
        <WalletListItem
          key={connector.id}
          connector={connector}
          onConnect={onConnect}
          isLoading={connectingToId == connector.id}
          WalletIcon={WalletIcon}
        />
      ))}
    </MenuList>
  </ModalDialog>
)
