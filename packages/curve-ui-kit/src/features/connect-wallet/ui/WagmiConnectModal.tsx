import { useState } from 'react'
import { BaseError } from 'viem/errors/base'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import MenuList from '@mui/material/MenuList'
import { t } from '@ui-kit/lib/i18n'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { useWagmi } from '../lib/wagmi/useWagmi'
import { supportedWallets, type WalletType } from '../lib/wagmi/wallets'

type WalletItemProps = {
  wallet: WalletType
  onConnect: () => void
}

const WalletListItem = ({ onConnect, wallet }: WalletItemProps) => {
  const { label, icon: Icon, connector } = wallet
  return <MenuItem key={label} label={label} icon={<Icon />} value={connector} onSelected={onConnect} />
}

type Props = {
  isOpen: boolean
  onConnected: () => void
  onClose: () => void
}

export const WagmiConnectModal = ({ isOpen, onConnected, onClose }: Props) => {
  const [, connect] = useWagmi()
  const [error, setError] = useState<unknown>(null)

  return (
    <ModalDialog open={isOpen} onClose={onClose} title={t`Connect Wallet`} titleAction={<WalletIcon />}>
      <MenuList>
        {supportedWallets.map((wallet) => (
          <WalletListItem
            wallet={wallet}
            onConnect={() => {
              setError(null)
              try {
                connect(wallet.label)
                onConnected()
              } catch (e) {
                console.info(e) // e.g. user rejected
                setError(e)
              }
            }}
            key={wallet.label}
          />
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
