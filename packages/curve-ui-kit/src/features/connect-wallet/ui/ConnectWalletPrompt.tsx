import { isLoading } from 'ui/src/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import ConnectWallet from 'ui/src/ConnectWalletPrompt'
import { useWalletStore } from '@ui-kit/features/connect-wallet/store'

type ConnectWalletPromptProps = {
  description: string
  connectText: string
  loadingText: string
}

export const ConnectWalletPrompt: React.FC<ConnectWalletPromptProps> = ({ description, connectText, loadingText }) => {
  const connectWallet = useWalletStore((s) => s.connectWallet)
  const connectState = useWalletStore((s) => s.connectState)
  const theme = useUserProfileStore((state) => state.theme)

  const loading = isLoading(connectState)

  return (
    <ConnectWallet
      connectWallet={connectWallet}
      description={description}
      connectText={connectText}
      loadingText={loadingText}
      isLoading={loading}
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}

export const setMissingProvider = <T extends { step: string; formProcessing?: boolean; error: string }>(slice: {
  setStateByKey: (key: 'formStatus', value: T) => void
  formStatus: T
}): undefined => {
  slice.setStateByKey('formStatus', {
    ...slice.formStatus,
    step: '',
    formProcessing: false,
    error: 'error-invalid-provider',
  })
  return
}
