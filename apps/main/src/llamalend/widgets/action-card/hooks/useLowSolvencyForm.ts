import { FieldValues, UseFormHandleSubmit } from 'react-hook-form'
import { useSolvencyLendMarket } from '@/llamalend/hooks/useSolvencyLendMarket'
import { DEFAULT_ALERT, SOLVENCY_THRESHOLDS } from '@/llamalend/llama-markets.constants'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { q } from '@ui-kit/types/util'
import { BlockchainIds } from '@ui-kit/utils/network'

type Props<T extends FieldValues, ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  chainId: ChainId
  onSubmit: (form: T) => Promise<void>
  handleFormSubmit: UseFormHandleSubmit<T, T>
}

const isLowSolvencyActionBlocked = (solvencyPercent: number | null | undefined) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.low

const requiresLowSolvencyConfirmation = (solvencyPercent: number | null | undefined) =>
  solvencyPercent != null && solvencyPercent >= SOLVENCY_THRESHOLDS.low && solvencyPercent < SOLVENCY_THRESHOLDS.solvent

export const useLowSolvencyForm = <T extends FieldValues, ChainId extends IChainId>({
  market,
  chainId,
  onSubmit,
  handleFormSubmit,
}: Props<T, ChainId>) => {
  const [isLowSolvencyModalOpen, openLowSolvencyModal, closeLowSolvencyModal] = useSwitch(false)
  const isLendMarket = market instanceof LendMarketTemplate
  const solvency = useSolvencyLendMarket(
    {
      blockchainId: BlockchainIds[chainId],
      controllerAddress: getControllerAddress(market),
    },
    isLendMarket,
  )
  const solvencyDisabledAlert =
    isLowSolvencyActionBlocked(solvency.data?.solvencyPercent) && isLendMarket ? DEFAULT_ALERT : undefined
  const shouldConfirmLowSolvency =
    !solvencyDisabledAlert && isLendMarket && requiresLowSolvencyConfirmation(solvency.data?.solvencyPercent)

  const handleConfirmLowSolvencyModal = () => {
    closeLowSolvencyModal()
    void handleFormSubmit(onSubmit)()
  }

  const handleSubmit = shouldConfirmLowSolvency
    ? handleFormSubmit(() => openLowSolvencyModal())
    : handleFormSubmit(onSubmit)

  return {
    solvency: q(solvency),
    solvencyDisabledAlert,
    handleConfirmLowSolvencyModal,
    handleSubmit,
    closeLowSolvencyModal,
    isLowSolvencyModalOpen,
  }
}
