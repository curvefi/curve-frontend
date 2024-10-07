import InpChipUsdRateComp from '@/ui/InpChipUsdRate'
import type { InpChipUsdRateProps } from '@/ui/InpChipUsdRate/InpChipUsdRate'

import useStore from '@/store/useStore'


const InpChipUsdRate = ({
  address = '',
  ...props
}: Omit<InpChipUsdRateProps, 'usdRate'> & { address: string | undefined }) => {
  const usdRate = useStore((state) => state.usdRates.tokens[address])
  return <InpChipUsdRateComp {...props} usdRate={usdRate} />
}

export default InpChipUsdRate
