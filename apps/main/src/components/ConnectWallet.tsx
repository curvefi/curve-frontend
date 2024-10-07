import ConnectWalletPrompt from '@/ui/ConnectWalletPrompt'
import { isLoading } from '@/ui/utils'
import useStore from '@/store/useStore'


type ConnectWalletProps = {
  description: string
  connectText: string
  loadingText: string
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ description, connectText, loadingText }) => {
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)
  const connectState = useStore((state) => state.connectState)
  const theme = useStore((state) => state.themeType)

  const loading = isLoading(connectState)

  return (
    <ConnectWalletPrompt
      connectWallet={updateConnectWalletStateKeys}
      description={description}
      connectText={connectText}
      loadingText={loadingText}
      isLoading={loading}
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}

export default ConnectWallet
