import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { DEFAULT_ALERT, SOLVENCY_THRESHOLDS } from '@/llamalend/markets.constants'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { FieldValues, UseFormHandleSubmit } from '@ui-kit/features/forms'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { MarketType } from '@ui-kit/types/market'
import { q } from '@ui-kit/types/util'
import { BlockchainIds } from '@ui-kit/utils/network'

type Props<T extends FieldValues, ChainId extends IChainId> = {
  controllerAddress: Address | undefined
  marketType: MarketType
  chainId: ChainId
  onSubmit: (form: T) => void
  handleFormSubmit: UseFormHandleSubmit<T>
}

const isLowSolvencyActionBlocked = (solvencyPercent: number | null | undefined) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.low

const requiresLowSolvencyModalConfirmation = (solvencyPercent: number | null | undefined) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.solvent

export const useFormLowSolvency = <T extends FieldValues, ChainId extends IChainId>({
  controllerAddress,
  marketType,
  chainId,
  onSubmit,
  handleFormSubmit,
}: Props<T, ChainId>) => {
  const [isOpen, openModal, closeModal] = useSwitch(false)
  const solvency = useSolvencyMarket({
    blockchainId: BlockchainIds[chainId],
    controllerAddress,
    marketType,
  })

  return {
    solvency: q(solvency),
    solvencyDisabledAlert: isLowSolvencyActionBlocked(solvency.data?.solvencyPercent) ? DEFAULT_ALERT : undefined,
    onConfirm: () => {
      closeModal()
      void handleFormSubmit(onSubmit)()
    },
    onSubmit: requiresLowSolvencyModalConfirmation(solvency.data?.solvencyPercent)
      ? handleFormSubmit(() => openModal())
      : handleFormSubmit(onSubmit),
    onClose: closeModal,
    isOpen,
  }
}
