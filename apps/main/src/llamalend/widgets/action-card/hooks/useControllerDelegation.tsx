import {
  useControllerApprovalEstimateGas,
  useIsControllerApproval,
} from '@/llamalend/queries/controller-approval.query'
import type { Address } from '@primitives/address.utils'
import type { FieldValues, UseFormHandleSubmit } from '@ui/features/forms'
import { constQ, q } from '@ui/features/queries/util'
import { useSwitch } from '@ui/hooks/useSwitch'

export function useControllerDelegation<T extends FieldValues>({
  chainId,
  userAddress,
  marketId,
  actionUsesZapV2,
  handleFormSubmit,
  onSubmit,
}: {
  chainId: number
  userAddress: Address | undefined
  marketId: string | undefined
  actionUsesZapV2: boolean
  handleFormSubmit: UseFormHandleSubmit<T>
  onSubmit: (values: T) => void | Promise<void>
}) {
  const [isOpen, openModal, closeModal] = useSwitch(false)
  const isControllerApprovalQuery = useIsControllerApproval({ chainId, marketId, userAddress }, actionUsesZapV2)
  // Disabling the query does not clear cached approval data or errors from an earlier ZapV2 selection.
  const isControllerApproved = actionUsesZapV2 ? q(isControllerApprovalQuery) : constQ(undefined)

  return {
    isControllerApproved,
    onSubmit: (values: T) => {
      if (!actionUsesZapV2 || isControllerApproved.data === true) void onSubmit(values)
      else openModal()
    },
    modal: {
      open: isOpen,
      gas: q(useControllerApprovalEstimateGas({ chainId, marketId, userAddress }, isOpen)),
      onClose: closeModal,
      onConfirm: () => {
        if (!isOpen) return
        closeModal()
        void handleFormSubmit(onSubmit)()
      },
    },
  }
}
