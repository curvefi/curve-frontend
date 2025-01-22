import { useUserProfileStore } from '@ui-kit/features/user-profile'
import ConnectWallet from '@ui/ConnectWalletPrompt'

type ConnectWalletPromptProps = {
  description: string
  connectText: string
  loadingText: string
  isLoading: boolean
  connectWallet: () => void
}

export const ConnectWalletPrompt = ({
  description,
  connectText,
  loadingText,
  connectWallet,
  isLoading,
}: ConnectWalletPromptProps) => (
  <ConnectWallet
    connectWallet={connectWallet}
    description={description}
    connectText={connectText}
    loadingText={loadingText}
    isLoading={isLoading}
    theme={useUserProfileStore((state) => state.theme)}
  />
)

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
