import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { RCCrvLogoMD } from '@ui/images'
import { t } from '@ui-kit/lib/i18n'

export const useMarketExtraIncentives = ({ lendCrvAprUnboosted }: LlamaMarket['rates']) =>
  useMemo(
    () => notFalsy(lendCrvAprUnboosted && { title: t`CRV`, percentage: lendCrvAprUnboosted, image: RCCrvLogoMD }),
    [lendCrvAprUnboosted],
  )
