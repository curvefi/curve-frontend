import { useCallback } from 'react'
import { SwitchChainNotSupportedError, useSwitchChain as useWagmiSwitchChain } from 'wagmi'
import { t } from '@ui-kit/lib/i18n'
import { notify } from './notify'

/**
 * Wraps wagmi's `useSwitchChain` and shows an error toast when the wallet does not support
 * programmatic chain switching (`SwitchChainNotSupportedError`).
 */
export const useSwitchChain = () => {
  const { mutateAsync } = useWagmiSwitchChain()
  return useCallback<typeof mutateAsync>(
    async (variables, options) => {
      try {
        return await mutateAsync(variables, options)
      } catch (error) {
        if (error instanceof SwitchChainNotSupportedError)
          notify(
            t`Your wallet does not support switching networks automatically. Please switch the network manually in your wallet.`,
            'error',
          )
        throw error
      }
    },
    [mutateAsync],
  )
}
