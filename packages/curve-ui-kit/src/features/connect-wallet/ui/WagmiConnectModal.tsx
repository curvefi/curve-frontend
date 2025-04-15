import { useCallback, useState } from 'react'
import { BaseError } from 'viem/errors/base'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import MenuList from '@mui/material/MenuList'
import { useWagmi } from '@ui-kit/features/connect-wallet/lib/wagmi/useWagmi'
import { t } from '@ui-kit/lib/i18n'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { supportedWallets, type WalletType } from '../lib/wagmi/wallets'

const { IconSize } = SizesAndSpaces

/**
 * Menu item for each wallet type. Only needed so we can useCallback
 */
const WalletListItem = ({
  onConnect: connect,
  wallet,
  isLoading,
  isDisabled,
}: {
  wallet: WalletType
  onConnect: (wallet: WalletType) => Promise<void>
  isLoading?: boolean
  isDisabled?: boolean
}) => {
  const { label, icon: Icon } = wallet
  const onConnect = useCallback(() => connect(wallet), [connect, wallet])

  return (
    <MenuItem
      key={label}
      label={label}
      labelVariant="bodyMBold"
      icon={<Icon sx={handleBreakpoints({ width: IconSize.xl, height: IconSize.xl })} />}
      value={label}
      onSelected={onConnect}
      isLoading={isLoading}
      disabled={isDisabled && !isLoading}
    />
  )
}

/**
 * Display a list of wallets to choose from, connecting to the selected one.
 * Use global state retrieved from the useWagmi hook to determine if the modal is open.
 */
export const WagmiConnectModal = () => {
  const [{ showModal }, connect, , closeModal] = useWagmi()
  const [error, setError] = useState<unknown>(null)
  const [isConnectingLabel, setIsConnectingLabel] = useState<string | null>(null)

  const onConnect = useCallback(
    async ({ label }: WalletType) => {
      setError(null)
      try {
        setIsConnectingLabel(label)
        await connect(label)
        closeModal()
      } catch (e) {
        console.info(e) // e.g. user rejected
        setError(e)
      } finally {
        setIsConnectingLabel(null)
      }
    },
    [connect, closeModal],
  )

  const wallets = supportedWallets.map((wallet) => ({
    wallet: wallet,
    onConnect: onConnect,
    key: wallet.label,
    isLoading: isConnectingLabel == wallet.label,
    isDisabled: !!isConnectingLabel,
  }))

  return (
    <ModalDialog open={showModal} onClose={closeModal} title={t`Connect Wallet`} titleAction={<WalletIcon />} compact>
      {error ? (
        <Alert variant="filled" severity="error">
          <AlertTitle>{t`Error connecting wallet`}</AlertTitle>
          {(error as BaseError).shortMessage ?? (error as Error).message ?? (error as string)}
        </Alert>
      ) : null}
      <MenuList>
        {wallets.map(({ key, ...props }) => (
          <WalletListItem key={key} {...props} />
        ))}
      </MenuList>
    </ModalDialog>
  )
}
