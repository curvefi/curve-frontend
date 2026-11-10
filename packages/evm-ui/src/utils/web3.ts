import { type Hex } from '@primitives/address.utils'
import { Duration } from '@ui/features/themes/design/0_primitives'
import { waitForTransaction } from '@ui/lib/waitForTransaction'
import { type Config, waitForTransactionReceipt } from '@wagmi/core'

export const gweiToEther = (gwei: number) => gwei / 1e9

export const gweiToWai = (gwei: number) => Math.trunc(gwei * 1e9)

export const weiToEther = (wei: number) => wei / 1e18

export const weiToGwei = (wai: number) => Math.trunc(wai) / 1e9

export const waitForApproval = async ({
  onApprove,
  config,
  isApproved,
  message,
  timeout = Duration.TransactionPollTimeout,
}: {
  onApprove: () => Promise<Hex[]>
  message: string
  isApproved: () => Promise<boolean>
  config: Config
  timeout?: number
}) =>
  await waitForTransaction({
    onExecute: onApprove,
    waitForConfirmation: async hash => {
      await waitForTransactionReceipt(config, { hash })
      return hash
    },
    isSatisfied: isApproved,
    onSatisfiedMessage: message,
    timeout,
  })
