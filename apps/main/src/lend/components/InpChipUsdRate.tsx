import { useChainId } from '@/lend/entities/chain'
import { InpChipUsdRate as InpChipUsdRateComp } from '@ui/InpChipUsdRate'
import type { InpChipUsdRateProps } from '@ui/InpChipUsdRate/InpChipUsdRate'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const InpChipUsdRate = ({
  address: tokenAddress,
  ...props
}: Omit<InpChipUsdRateProps, 'usdRate'> & { address: string | undefined }) => {
  const { data: chainId } = useChainId()
  const { data: usdRate } = useTokenUsdRate({ chainId, tokenAddress })
  return <InpChipUsdRateComp {...props} usdRate={usdRate} />
}
