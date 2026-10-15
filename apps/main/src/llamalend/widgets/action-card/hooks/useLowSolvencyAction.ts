import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { DEFAULT_ALERT, SOLVENCY_THRESHOLDS } from '@/llamalend/markets.constants'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MarketType } from '@evm-ui/types/market'
import { BlockchainIds } from '@evm-ui/utils/network'
import type { Address } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'
import { useSwitch } from '@ui/hooks/useSwitch'

type Props<ChainId extends IChainId> = {
  controllerAddress: Address | undefined
  marketType: MarketType
  chainId: ChainId
}

const isLowSolvencyActionBlocked = (solvencyPercent: number | Nullish) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.low

const requiresLowSolvencyModalConfirmation = (solvencyPercent: number | Nullish) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.solvent

/** Blocks the form when the market is insolvent, and asks for confirmation when its solvency is low. */
export const useLowSolvencyAction = <ChainId extends IChainId>({
  controllerAddress,
  marketType,
  chainId,
}: Props<ChainId>) => {
  const [isOpen, open, close] = useSwitch(false)
  const solvency = useSolvencyMarket({ blockchainId: BlockchainIds[chainId], controllerAddress, marketType })
  const solvencyPercent = solvency.data?.solvencyPercent
  return {
    isRequired: requiresLowSolvencyModalConfirmation(solvencyPercent),
    isOpen,
    open,
    close,
    isLoading: solvency.isLoading,
    error: solvency.error,
    disabledAlert: isLowSolvencyActionBlocked(solvencyPercent) ? DEFAULT_ALERT : undefined,
  }
}
