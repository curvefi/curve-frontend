import { useMemo } from 'react'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Address } from '@primitives/address.utils'
import { DEFAULT_DECIMALS } from '@ui-kit/utils/units'

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Existing violation before enabling this rule.
  useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Existing violation before enabling this rule.
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
