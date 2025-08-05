import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { RCCrvLogoMD } from '@ui/images'
import { t } from '@ui-kit/lib/i18n'

export const useMarketExtraIncentives = (type: RateType, { lendCrvAprUnboosted, incentives }: LlamaMarket['rates']) =>
  useMemo(() => {
    if (type !== 'lend') return []

    return notFalsy(
      lendCrvAprUnboosted && { title: t`CRV`, percentage: lendCrvAprUnboosted, image: RCCrvLogoMD },
      ...incentives.map((incentive) => ({ title: incentive.symbol, percentage: incentive.rate, image: RCCrvLogoMD })),
    )
  }, [incentives, lendCrvAprUnboosted, type])
