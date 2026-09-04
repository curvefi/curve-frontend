import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { SlippageToleranceActionInfo } from './SlippageToleranceActionInfo'

export const EvmSlippageToleranceActionInfo = (
  props: Omit<ComponentProps<typeof SlippageToleranceActionInfo>, 'userAddress'>,
) => <SlippageToleranceActionInfo {...props} userAddress={useConnection().address} />
