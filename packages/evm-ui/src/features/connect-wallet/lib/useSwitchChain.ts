import { useCallback } from 'react'
import { useSwitchChain as useWagmiSwitchChain } from 'wagmi'
import { getErrorMessage, isUnsupportedChainError } from '@ui/features/errors/errors.util'
import { notify } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'

const showSwitchChainError = (error: unknown) =>
  notify(
    isUnsupportedChainError(error)
      ? t`Your wallet does not support switching networks automatically. Please switch the network manually in your wallet.`
      : getErrorMessage(error, t`Unable to switch networks. Please try again or switch manually in your wallet.`),
    'error',
  )

/** One awaited operation for all callers; failures are displayed here and resolve without a chain. */
export const useSwitchChain = () => {
  const { mutateAsync } = useWagmiSwitchChain()
  return useCallback(
    async (...args: Parameters<typeof mutateAsync>) =>
      // Button handlers discard this promise. Resolve after showing the error to avoid an unhandled rejection;
      await mutateAsync(...args).catch(error => showSwitchChainError(error)),
    [mutateAsync],
  )
}
