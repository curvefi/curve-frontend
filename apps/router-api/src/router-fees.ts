import { BigNumber } from 'bignumber.js'
import { getAddress } from 'viem'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
// eslint-disable-next-line no-restricted-imports -- Server-side fee selection requires the controller mapping.
import { MARKET_ASSETS_TYPE_BY_CONTROLLER, MarketAssetsType } from '@primitives/llamalend/markets.constants'
import { Chain } from '@primitives/network.utils'
import { assert } from '@primitives/objects.utils'
import type { ExternalRouteProvider } from '@primitives/router.utils'
import type { RoutesQuery } from './routes/routes.schemas'

/** note: no fractions allowed by enso */
export const ROUTER_FEE_BPS: Record<MarketAssetsType, Decimal> = {
  [MarketAssetsType.Correlated]: '2',
  [MarketAssetsType.BlueChip]: '6',
  [MarketAssetsType.LongTail]: '10',
}

export const ROUTER_FEE_RECEIVER_BY_CHAIN_ID: Record<ExternalRouteProvider, Record<number, Address>> = {
  /** Enso fee splitter contracts distribute router fees 50/50 between Curve and Enso. */
  enso: {
    [Chain.Ethereum]: '0x428C2a762EE70c18d7e370Da1b5A2951bE717c49',
    [Chain.Optimism]: '0x0124a166a139ce1a9671e6a00a470bed2915ee6f',
  },
  '0x': {
    [Chain.Ethereum]: '0xB4c2C0B045fA0517cACEebC917443Fa041A9c18B',
    [Chain.Optimism]: '0x3Aa9742e8BA5eA0F573FcE69e1c8b49aFd0Af610',
  },
}

/**
 * Selects the configured fee when the provider has a receiver on the chain.
 * Requests without a controller (not LlamaLend, e.g. the Balancer migration) carry no fee.
 */
export const getRouterFee = (
  provider: ExternalRouteProvider,
  { chainId, controllerAddress }: Pick<RoutesQuery, 'chainId' | 'controllerAddress'>,
) => {
  const feeReceiver = ROUTER_FEE_RECEIVER_BY_CHAIN_ID[provider][chainId]
  if (!feeReceiver || !controllerAddress) return

  const assetsType = assert(
    MARKET_ASSETS_TYPE_BY_CONTROLLER[chainId]?.[getAddress(controllerAddress)],
    `A supported controllerAddress is required for ${provider} on chain ${chainId}`,
  )
  return { feeBps: ROUTER_FEE_BPS[assetsType], feeReceiver }
}

/** Calculates the total fee amount as a percentage of the provided amount. */
export const calculateFeePercentage = (feeAmounts: readonly Decimal[], totalAmount: Decimal): Decimal => {
  const total = new BigNumber(totalAmount)
  return total.isZero()
    ? '0'
    : (BigNumber.sum(0, ...feeAmounts)
        .div(total)
        .times(100)
        .toFixed() as Decimal)
}

/** Compounds sequential fee percentages into one effective percentage. */
export const combineFeePercentages = (...feePercentages: Decimal[]): Decimal =>
  new BigNumber(1)
    .minus(
      feePercentages.reduce(
        (remaining, feePercentage) => remaining.times(new BigNumber(1).minus(new BigNumber(feePercentage).div(100))),
        new BigNumber(1),
      ),
    )
    .times(100)
    .toFixed() as Decimal
