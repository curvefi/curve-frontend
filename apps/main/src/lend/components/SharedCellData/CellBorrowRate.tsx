import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

const CellBorrowRate = ({
  rChainId,
  rOwmId,
  defaultValue,
}: {
  rChainId: ChainId
  rOwmId: string
  defaultValue?: string
}) => {
  // uses onchain data if available
  const { data: onchainData } = useMarketOnChainRates({ chainId: rChainId, marketId: rOwmId })
  const resp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { rates, error } = resp ?? {}

  if (typeof resp === 'undefined') {
    return <>{defaultValue ?? '-'}</>
  }

  if (error) {
    return <>?</>
  }

  return formatNumber(onchainData?.borrowApy ?? rates?.borrowApy, { ...FORMAT_OPTIONS.PERCENT, defaultValue })
}

export default CellBorrowRate
