import { isLoading } from '@/ui/utils'
import useStore from '@/store/useStore'

import { CONNECT_STAGE } from '@/constants'

import ConnectWalletPrompt from '@/ui/ConnectWalletPrompt'

type ConnectWalletProps = {
  description: string
  connectText: string
  loadingText: string
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ description, connectText, loadingText }) => {
  const updateConnectState = useStore((state) => state.updateConnectState)
  const connectState = useStore((state) => state.connectState)
  const loading = isLoading(connectState)
  const theme = useStore((state) => state.themeType)

  return (
    <ConnectWalletPrompt
      connectWallet={() => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [''])}
      description={description}
      connectText={connectText}
      loadingText={loadingText}
      isLoading={loading}
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}

export default ConnectWallet
