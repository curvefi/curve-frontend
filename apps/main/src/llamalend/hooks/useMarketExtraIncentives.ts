import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { RCCrvLogoMD } from '@ui/images'
import { t } from '@ui-kit/lib/i18n'

export const useMarketExtraIncentives = (type: RateType, { lendCrvAprUnboosted }: LlamaMarket['rates']) =>
  useMemo(
    () =>
      notFalsy(
        type === 'lend' &&
          lendCrvAprUnboosted && { title: t`CRV`, percentage: lendCrvAprUnboosted, image: RCCrvLogoMD },
      ),
    [lendCrvAprUnboosted, type],
  )
