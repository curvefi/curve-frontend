import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import MenuList from '@mui/material/MenuList'
import { t } from '@ui-kit/lib/i18n'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SupportedWallets, type Wallet } from '../lib'
import type { WalletType } from '../lib/wagmi/setup'
import { useWagmiWallet } from '../lib/wagmi/wallet'

const WalletListItem = ({
  setError: setError,
  onConnect,
  wallet,
}: {
  wallet: WalletType
  onConnect: (label?: string) => Promise<Wallet | null>
  setError: Dispatch<SetStateAction<Error | null>>
}) => {
  const { label, icon: Icon, connector } = wallet
  const onSelected = useCallback(async () => {
    try {
      setError(null)
      await onConnect(label)
      close()
    } catch (e) {
      console.log(e)
      setError(e)
    }
  }, [onConnect, label, setError])
  return <MenuItem key={label} label={label} icon={<Icon />} value={connector} onSelected={onSelected} />
}

export const WagmiConnectModal = () => {
  const [{ isModalOpen }, connect, , close] = useWagmiWallet()
  const [error, setError] = useState<Error | null>(null)
  return (
    <ModalDialog open={isModalOpen} onClose={close} title={t`Connect Wallet`} titleAction={<WalletIcon />}>
      <MenuList>
        {SupportedWallets.map((wallet) => (
          <WalletListItem wallet={wallet} onConnect={connect} setError={setError} key={wallet.label} />
        ))}
      </MenuList>
      {error && (
        <Alert variant="filled" severity="error">
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      )}
    </ModalDialog>
  )
}
