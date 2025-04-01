import MenuList from '@mui/material/MenuList'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SupportedWallets } from '../lib'

export const WagmiConnectModal = ({ onConnect }: { onConnect: (label?: string) => Promise<unknown> }) => {
  const [isOpen, , close] = useSwitch(true)
  return (
    <ModalDialog open={isOpen} onClose={close} title={t`Connect Wallet`} titleAction={<WalletIcon />}>
      <MenuList>
        {SupportedWallets.map(({ label, icon: Icon, connector }) => (
          <MenuItem
            key={connector.prototype.type}
            label={label}
            icon={<Icon />}
            value={connector.prototype.type}
            onSelected={() => onConnect(label)}
          />
        ))}
      </MenuList>
    </ModalDialog>
  )
}
