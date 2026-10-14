import { useControllerApprovalEstimateGas } from '@/llamalend/queries/controller-approval-gas-estimate.query'
import type { Address } from '@primitives/address.utils'
import { q, type QueryProp } from '@ui/features/queries/util'
import { useSwitch } from '@ui/hooks/useSwitch'

/** Asks the user to approve the leverage delegation when the controller isn't approved yet. */
export const useControllerDelegationAction = ({
  chainId,
  userAddress,
  marketId,
  approval,
}: {
  chainId: number
  userAddress: Address | undefined
  marketId: string | undefined
  approval: QueryProp<boolean>
}) => {
  const [isOpen, open, close] = useSwitch(false)
  return {
    isRequired: !approval.data,
    isOpen,
    open,
    close,
    isLoading: approval.isLoading,
    error: approval.error,
    gas: q(useControllerApprovalEstimateGas({ chainId, marketId, userAddress }, isOpen)),
  }
}
