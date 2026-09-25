import { usesZapV2 } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { useIsControllerApproval } from '@/llamalend/queries/controller-approval.query'
import type { Address } from '@primitives/address.utils'
import type { FieldValues, UseFormHandleSubmit } from '@ui/features/forms'
import { constQ, q } from '@ui/features/queries/util'
import { useSwitch } from '@ui/hooks/useSwitch'

export function useLeverageDelegation<T extends FieldValues>({
  chainId,
  userAddress,
  market,
  leverageEnabled,
  handleFormSubmit,
  onSubmit,
}: {
  chainId: number
  userAddress: Address | undefined
  market: MarketTemplate | undefined
  leverageEnabled: boolean
  handleFormSubmit: UseFormHandleSubmit<T>
  onSubmit: (values: T) => void | Promise<void>
}) {
  const [isOpen, openModal, closeModal] = useSwitch(false)
  const isZapV2Enabled = usesZapV2(market, leverageEnabled)
  const isControllerApprovalQuery = useIsControllerApproval(
    { chainId, marketId: market?.id, userAddress },
    isZapV2Enabled,
  )
  // Disabling the query does not clear cached approval data or errors from an earlier ZapV2 selection.
  const isControllerApproved = isZapV2Enabled ? q(isControllerApprovalQuery) : constQ(undefined)

  return {
    isControllerApproved,
    onSubmit: (values: T) => {
      if (!isZapV2Enabled || isControllerApproved.data === true) void onSubmit(values)
      else openModal()
    },
    modal: {
      open: isOpen,
      onClose: closeModal,
      onConfirm: () => {
        if (!isOpen) return
        closeModal()
        void handleFormSubmit(onSubmit)()
      },
    },
  }
}
