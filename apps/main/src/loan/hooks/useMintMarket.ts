import { useMemo } from 'react'
import { ChainId } from '@/loan/types/loan.types'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Address } from '@curvefi/primitives/address.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { ChainParams } from '@ui-kit/lib/model/query'
import { useMintMarketNames } from '../entities/mint-market-names.query'

const useMintMarketMapping = ({ chainId }: ChainParams<ChainId>) => {
  const { data: marketNames, error, isLoading } = useMintMarketNames({ chainId })
  const { llamaApi: api, isHydrated } = useCurve()
  const apiChainId = api?.chainId
  const data: Record<string, MintMarketTemplate> | undefined = useMemo(
    () =>
      // note: only during hydration `api` internally retrieves all the markets, and we can call `getOneWayMarket`
      marketNames && api && chainId == apiChainId && isHydrated
        ? Object.fromEntries(
            marketNames
              .map(name => [name, api.getMintMarket(name)] as const)
              .flatMap(([name, market]) => [
                [name, market],
                [market.controller, market],
              ]),
          )
        : undefined,
    [api, apiChainId, chainId, isHydrated, marketNames],
  )
  return { data, isSuccess: !!data, error, isLoading }
}

export const useMintMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string | Address }) => {
  const { data: markets, ...rest } = useMintMarketMapping({ chainId })
  return { data: markets?.[marketId], ...rest }
}
