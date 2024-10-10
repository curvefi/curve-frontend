import type { InpChipUsdRateProps } from '@/ui/InpChipUsdRate/InpChipUsdRate'

import InpChipUsdRateComp from '@/ui/InpChipUsdRate'
import { useTokenUsdRate } from '@/entities/token'
import { useChainId } from '@/entities/chain'

const InpChipUsdRate = ({
  address: tokenAddress,
  ...props
}: Omit<InpChipUsdRateProps, 'usdRate'> & { address: string | undefined }) => {
  const { data: chainId } = useChainId()
  const { data: usdRate } = useTokenUsdRate({ chainId, tokenAddress })
  return <InpChipUsdRateComp {...props} usdRate={usdRate} />
}

export default InpChipUsdRate
