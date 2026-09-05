import { useConnection } from 'wagmi'
import {
  type ConnectionProps,
  ConnectWalletButton,
  type ConnectWalletButtonProps,
} from '@ui/components/ConnectWalletButton'
import { useWallet } from '../lib'

export const ConnectEvmWalletButton = (props: Omit<ConnectWalletButtonProps, keyof ConnectionProps>) => {
  const { isConnecting, isConnected } = useConnection()
  const { connect } = useWallet()
  return <ConnectWalletButton isConnecting={isConnecting} isConnected={isConnected} connect={connect} {...props} />
}
