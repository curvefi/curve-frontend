import { useLoanPositionDetails } from '@/loan/hooks/useLoanPositionDetails'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { PositionDetails } from '@ui-kit/shared/ui/PositionDetails'

type PositionDetailsWrapperProps = {
  rChainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
  health: string | undefined
}

export const PositionDetailsWrapper = ({ rChainId, llamma, llammaId, health }: PositionDetailsWrapperProps) => {
  const positionDetailsProps = useLoanPositionDetails({
    rChainId,
    llamma,
    llammaId,
    health,
  })

  return <PositionDetails {...positionDetailsProps} />
}
