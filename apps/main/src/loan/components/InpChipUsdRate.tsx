import { useChainId } from 'wagmi'
import InpChipUsdRateComp from '@ui/InpChipUsdRate'
import type { InpChipUsdRateProps } from '@ui/InpChipUsdRate/InpChipUsdRate'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

const InpChipUsdRate = ({
  address = '',
  ...props
}: Omit<InpChipUsdRateProps, 'usdRate'> & { address: string | undefined }) => {
  const chainId = useChainId()
  const { data: usdRate } = useTokenUsdRate({ chainId, tokenAddress: address })
  return <InpChipUsdRateComp {...props} usdRate={usdRate} />
}

export default InpChipUsdRate
