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
import { supportedWallets, type WalletType } from '../lib/wagmi/wallets'

/**
 * Menu item for each wallet type. Only needed so we can useCallback
 */
const WalletListItem = ({
  onConnect: connect,
  wallet,
}: {
  wallet: WalletType
  onConnect: (wallet: WalletType) => void
}) => {
  const { label, icon: Icon, connector } = wallet
  const onConnect = useCallback(() => connect(wallet), [connect, wallet])
  return <MenuItem key={label} label={label} icon={<Icon />} value={connector} onSelected={onConnect} />
}

/**
 * Display a list of wallets to choose from, connecting to the selected one.
 * Use global state retrieved from the useWagmi hook to determine if the modal is open.
 */
export const WagmiConnectModal = () => {
  const [{ connecting }, connect, , closeModal] = useWagmi()
  const [error, setError] = useState<unknown>(null)

  const onConnect = useCallback(
    async ({ label }: WalletType) => {
      setError(null)
      try {
        await connect(label)
      } catch (e) {
        console.info(e) // e.g. user rejected
        setError(e)
      }
    },
    [connect],
  )

  return (
    <ModalDialog open={connecting} onClose={closeModal} title={t`Connect Wallet`} titleAction={<WalletIcon />}>
      <MenuList>
        {supportedWallets.map((wallet) => (
          <WalletListItem wallet={wallet} onConnect={onConnect} key={wallet.label} />
        ))}
      </MenuList>
      {error ? (
        <Alert variant="filled" severity="error">
          <AlertTitle>{t`Error connecting wallet`}</AlertTitle>
          {(error as BaseError).shortMessage ?? (error as Error).message ?? (error as string)}
        </Alert>
      ) : null}
    </ModalDialog>
  )
}
