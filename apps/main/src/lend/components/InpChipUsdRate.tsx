import { useChainId } from '@/lend/entities/chain'
import { useTokenUsdRate } from '@/lend/entities/token'
import InpChipUsdRateComp from '@ui/InpChipUsdRate'
import type { InpChipUsdRateProps } from '@ui/InpChipUsdRate/InpChipUsdRate'

const InpChipUsdRate = ({
  address: tokenAddress,
  ...props
}: Omit<InpChipUsdRateProps, 'usdRate'> & { address: string | undefined }) => {
  const { data: chainId } = useChainId()
  const { data: usdRate } = useTokenUsdRate({ chainId, tokenAddress })
  return <InpChipUsdRateComp {...props} usdRate={usdRate} />
}

export default InpChipUsdRate
