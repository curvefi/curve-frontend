import { isLoading } from '@/ui/utils'
import useStore from '@/dex/store/useStore'

import ConnectWalletPrompt from '@/ui/ConnectWalletPrompt'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

type ConnectWalletProps = {
  description: string
  connectText: string
  loadingText: string
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ description, connectText, loadingText }) => {
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)
  const connectState = useStore((state) => state.connectState)

  const theme = useUserProfileStore((state) => state.theme)

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
