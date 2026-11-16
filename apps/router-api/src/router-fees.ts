import { BigNumber } from 'bignumber.js'
import { getAddress } from 'viem'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
// eslint-disable-next-line no-restricted-imports -- Server-side fee selection requires the controller mapping.
import { MARKET_ASSETS_TYPE_BY_CONTROLLER, MarketAssetsType } from '@primitives/llamalend/markets.constants'
import { Chain } from '@primitives/network.utils'
import type { ExternalRouteProvider } from '@primitives/router.utils'
import { HttpError } from './router.utils'
import type { RoutesQuery } from './routes/routes.schemas'

/** note: no fractions allowed by enso */
export const ROUTER_FEE_BPS: Record<MarketAssetsType, Decimal> = {
  [MarketAssetsType.Correlated]: '2',
  [MarketAssetsType.BlueChip]: '6',
  [MarketAssetsType.LongTail]: '10',
}

export const ROUTER_FEE_RECEIVER_BY_CHAIN_ID: Record<ExternalRouteProvider, Record<number, Address>> = {
  /** Enso-owned receivers: all router fees go to Enso. */
  enso: {
    [Chain.Ethereum]: '0xAb27dB9E0105AF3d9717b0CcEf11e2CC65515609',
    [Chain.Optimism]: '0x69AFa05352B3797b8D08cE3B5EDf27eb0585D560',
  },
  '0x': {
    [Chain.Ethereum]: '0xB4c2C0B045fA0517cACEebC917443Fa041A9c18B',
    [Chain.Optimism]: '0x3Aa9742e8BA5eA0F573FcE69e1c8b49aFd0Af610',
  },
}

/** Selects the configured fee when the provider has a receiver on the chain. */
export const getRouterFee = (
  provider: ExternalRouteProvider,
  { chainId, controllerAddress }: Pick<RoutesQuery, 'chainId' | 'controllerAddress'>,
) => {
  const feeReceiver = ROUTER_FEE_RECEIVER_BY_CHAIN_ID[provider][chainId]
  if (!feeReceiver) return

  const assetsType = controllerAddress && MARKET_ASSETS_TYPE_BY_CONTROLLER[chainId]?.[getAddress(controllerAddress)]
  if (!assetsType) {
    throw new HttpError(400, `A supported controllerAddress is required for ${provider} on chain ${chainId}`)
  }
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
