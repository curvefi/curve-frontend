import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { DEFAULT_ALERT, SOLVENCY_THRESHOLDS } from '@/llamalend/markets.constants'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MarketType } from '@evm-ui/types/market'
import { BlockchainIds } from '@evm-ui/utils/network'
import type { Address } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'
import { FieldValues, UseFormHandleSubmit } from '@ui/features/forms'
import { q } from '@ui/features/queries/util'
import { useSwitch } from '@ui/hooks/useSwitch'

type Props<T extends FieldValues, ChainId extends IChainId> = {
  controllerAddress: Address | undefined
  marketType: MarketType
  chainId: ChainId
  onSubmit: (form: T) => void
  handleFormSubmit: UseFormHandleSubmit<T>
}

const isLowSolvencyActionBlocked = (solvencyPercent: number | Nullish) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.low

const requiresLowSolvencyModalConfirmation = (solvencyPercent: number | Nullish) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.solvent

export const useFormLowSolvency = <T extends FieldValues, ChainId extends IChainId>({
  controllerAddress,
  marketType,
  chainId,
  onSubmit,
  handleFormSubmit,
}: Props<T, ChainId>) => {
  const [isOpen, openModal, closeModal] = useSwitch(false)
  const solvency = useSolvencyMarket({ blockchainId: BlockchainIds[chainId], controllerAddress, marketType })

  return {
    solvency: q(solvency),
    solvencyDisabledAlert: isLowSolvencyActionBlocked(solvency.data?.solvencyPercent) ? DEFAULT_ALERT : undefined,
    onSubmit: requiresLowSolvencyModalConfirmation(solvency.data?.solvencyPercent)
      ? handleFormSubmit(() => openModal())
      : handleFormSubmit(onSubmit),
    modal: {
      open: isOpen,
      onClose: closeModal,
      onConfirm: () => {
        closeModal()
        void handleFormSubmit(onSubmit)()
      },
    },
  }
}
