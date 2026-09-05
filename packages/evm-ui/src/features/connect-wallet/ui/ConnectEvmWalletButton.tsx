import { useConnection } from 'wagmi'
import { useWallet } from '../lib'
import { type ConnectionProps, ConnectWalletButton, type ConnectWalletButtonProps } from './ConnectWalletButton'

export const ConnectEvmWalletButton = (props: Omit<ConnectWalletButtonProps, keyof ConnectionProps>) => {
  const { isConnecting, isConnected } = useConnection()
  const { connect } = useWallet()
  return <ConnectWalletButton isConnecting={isConnecting} isConnected={isConnected} connect={connect} {...props} />
}
