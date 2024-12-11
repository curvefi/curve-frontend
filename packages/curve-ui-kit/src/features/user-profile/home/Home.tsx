import { ConnectWalletIndicatorProps } from 'curve-common/src/features/connect-wallet'
import { Header } from './Header'

type Props = {
  walletAddress: NonNullable<ConnectWalletIndicatorProps['walletAddress']>
  onClose: () => void
}

export const Home = ({ walletAddress, onClose }: Props) => {
  return <Header walletAddress={walletAddress} onClose={onClose} />
}
