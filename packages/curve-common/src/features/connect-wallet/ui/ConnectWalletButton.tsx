import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import type { SxProps, Theme } from '@mui/system'

export type ConnectWalletButtonProps = {
  onConnectWallet: () => void
  label: string
  disabled?: boolean
  sx?: SxProps<Theme>
}

export const ConnectWalletButton = ({ onConnectWallet, label, ...props }: ConnectWalletButtonProps) =>
  <Button size="small" variant="contained" color="primary" onClick={onConnectWallet} {...props}>
    {label}
  </Button>
