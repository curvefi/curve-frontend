import { BigNumber } from 'bignumber.js'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useMarketFutureRates } from '@/llamalend/queries/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import type { RepayParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Chain } from '@curvefi/prices-api'
import { useLlamaSnapshot } from '@ui-kit/entities/llama-snapshots'
import { q } from '@ui-kit/types/util'
import { Decimal, decimal } from '@ui-kit/utils'

const getNetBorrowApr = (borrowApr?: Decimal, rebasingYield?: number | null) =>
  borrowApr && decimal(new BigNumber(borrowApr).minus(rebasingYield ?? 0))

export function useNetBorrowApr<ChainId extends IChainId>(
  market: LendMarketTemplate | MintMarketTemplate | undefined,
  networks: NetworkDict<ChainId>,
  params: RepayParams<ChainId>,
  isOpen: boolean,
) {
  const blockchainId = networks[params.chainId!]?.id as Chain | undefined
  const snapshotsQuery = useLlamaSnapshot(market, blockchainId, isOpen)
  const rebasingYield = snapshotsQuery.data?.[snapshotsQuery.data.length - 1]?.collateralToken?.rebasingYield ?? null
  const marketRates = q(useMarketRates(params, isOpen))
  const marketFutureRates = q(useMarketFutureRates(params, isOpen))
  return {
    marketRates,
    marketFutureRates,
    netBorrowApr: {
      data: getNetBorrowApr(marketFutureRates.data?.borrowApr, rebasingYield) ?? null,
      error: marketFutureRates.error ?? snapshotsQuery.error,
      isLoading: marketFutureRates.isLoading || snapshotsQuery.isLoading,
    },
    prevNetBorrowApr: {
      data: getNetBorrowApr(marketRates.data?.borrowApr, rebasingYield) ?? null,
      error: marketRates.error ?? snapshotsQuery.error,
      isLoading: marketRates.isLoading || snapshotsQuery.isLoading,
    },
  }
}
