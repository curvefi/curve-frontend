import { useControllerApprovalEstimateGas } from '@/llamalend/queries/controller-approval.query'
import type { Address } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
import type { FieldValues, UseFormHandleSubmit } from '@ui/features/forms'
import { q, type QueryProp } from '@ui/features/queries/util'
import { useSwitch } from '@ui/hooks/useSwitch'

export function useControllerDelegation<T extends FieldValues>({
  chainId,
  userAddress,
  marketId,
  approval,
  handleFormSubmit,
  onSubmit,
}: {
  chainId: number
  userAddress: Address | undefined
  marketId: string | undefined
  approval: QueryProp<boolean>
  handleFormSubmit: UseFormHandleSubmit<T>
  onSubmit: (values: T) => void | Promise<void>
}) {
  const [isOpen, openModal, closeModal] = useSwitch(false)
  return {
    onSubmit: (values: T) => {
      assert(approval.data != null, 'Controller approval check returned no result')
      if (approval.data === false) openModal()
      else void onSubmit(values)
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
