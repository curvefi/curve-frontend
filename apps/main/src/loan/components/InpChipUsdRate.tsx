import type { InpChipUsdRateProps } from '@ui/InpChipUsdRate/InpChipUsdRate'

import useStore from '@/loan/store/useStore'

import InpChipUsdRateComp from '@ui/InpChipUsdRate'
import { useUsdRate } from '@ui-kit/lib/entities/usd-rates'

const InpChipUsdRate = ({
  address = '',
  ...props
}: Omit<InpChipUsdRateProps, 'usdRate'> & { address: string | undefined }) => {
  const curve = useStore((state) => state.curve)
  const { data: usdRate } = useUsdRate(curve?.getUsdRate, address)
  return <InpChipUsdRateComp {...props} usdRate={usdRate} />
}

export default InpChipUsdRate
