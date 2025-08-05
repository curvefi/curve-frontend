import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { t } from '@ui-kit/lib/i18n'

const CRV_ADDRESS = '0xd533a949740bb3306d119cc777fa900ba034cd52'

export const useMarketExtraIncentives = (
  type: RateType,
  blockchainId: string,
  { lendCrvAprUnboosted, incentives }: LlamaMarket['rates'],
) =>
  useMemo(() => {
    if (type !== 'lend') return []

    return notFalsy(
      lendCrvAprUnboosted && {
        title: t`CRV`,
        percentage: lendCrvAprUnboosted,
        address: CRV_ADDRESS,
        blockchainId: 'ethereum',
      },
      ...incentives.map((incentive) => ({
        title: incentive.symbol,
        percentage: incentive.rate,
        address: incentive.address,
        blockchainId,
      })),
    )
  }, [incentives, lendCrvAprUnboosted, type, blockchainId])
