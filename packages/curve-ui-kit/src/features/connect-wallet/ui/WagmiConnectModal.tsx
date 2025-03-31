import MenuList from '@mui/material/MenuList'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { MetamaskIcon } from '@ui-kit/shared/icons/MetamaskIcon'

export const WagmiConnectModal = () => {
  const [isOpen, , close] = useSwitch(true)
  return (
    <ModalDialog open={isOpen} onClose={close} title={t`Connect Wallet`} titleAction={<WalletIcon />}>
      <MenuList>

      </MenuList>
    </ModalDialog>
  )
}
