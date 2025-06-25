import { usePositionDetails } from '@/lend/hooks/usePositionDetails'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { PositionDetails } from '@ui-kit/shared/ui/PositionDetails'

type PositionDetailsWrapperProps = {
  rChainId: ChainId
  market: OneWayMarketTemplate | undefined
  marketId: string
  userActiveKey: string
}

export const PositionDetailsWrapper = ({ rChainId, market, marketId, userActiveKey }: PositionDetailsWrapperProps) => {
  const positionDetailsProps = usePositionDetails({
    rChainId,
    market,
    marketId,
    userActiveKey,
  })

  return <PositionDetails {...positionDetailsProps} />
}
