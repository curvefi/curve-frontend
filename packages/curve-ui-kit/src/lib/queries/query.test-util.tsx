import { type ReactNode, useEffect, useMemo } from 'react'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Address } from '@primitives/address.utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DEFAULT_DECIMALS } from '@ui-kit/utils/units'

export function TestQueryProvider({
  children,
  data,
}: {
  children: ReactNode
  data: Parameters<QueryClient['setQueryData']>[]
}) {
  const client = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }), [])
  useEffect(
    () => data.forEach(([key, data]) => void client.setQueryData(key, data)),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [client],
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export const useFakeMarket = ({
  collateralAddress,
  collateralSymbol,
  borrowSymbol,
  borrowAddress,
}: {
  collateralAddress: Address
  collateralSymbol: string
  borrowSymbol: string
  borrowAddress: Address
}) =>
  useMemo(
    () =>
      Object.assign(Object.create(LendMarketTemplate.prototype), {
        borrowed_token: {
          address: borrowAddress,
          name: borrowSymbol,
          symbol: borrowSymbol,
          decimals: DEFAULT_DECIMALS,
        },
        collateral_token: {
          address: collateralAddress,
          name: collateralSymbol,
          symbol: collateralSymbol,
          decimals: DEFAULT_DECIMALS,
        },
      }),
    [collateralAddress, collateralSymbol, borrowAddress, borrowSymbol],
  )
