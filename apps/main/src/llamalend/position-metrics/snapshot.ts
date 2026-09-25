import { formatUnits } from 'viem'
import { getMarket } from '@/llamalend/llama.utils'
import type { Call } from '@curvefi/ethcall'
import type { ILlamalend } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { decimal } from '@ui/lib/decimal'
import type { Available, PositionSnapshot } from './snapshot.types'

type Contracts = {
  controller: string
  amm: string
  collateralDecimals: number
  borrowedDecimals: number
  lend: boolean
}

const contractsFor = (marketId: string): Contracts => {
  const market = getMarket(marketId)
  if (market instanceof LendMarketTemplate) {
    return {
      controller: market.addresses.controller,
      amm: market.addresses.amm,
      collateralDecimals: market.collateral_token.decimals,
      borrowedDecimals: market.borrowed_token.decimals,
      lend: true,
    }
  }
  return {
    controller: market.controller,
    amm: market.address,
    collateralDecimals: market.collateralDecimals,
    borrowedDecimals: 18,
    lend: false,
  }
}

const unavailable = (reason: string): Available<never> => ({ status: 'unavailable', reason })

const decimalField = (raw: unknown, decimals: number, reason: string): Available<Decimal> => {
  if (typeof raw !== 'bigint') return unavailable(reason)
  const value = decimal(formatUnits(raw, decimals))
  if (value == undefined) return unavailable(reason)
  return { status: 'value', value }
}

const tupleBigints = (raw: unknown): bigint[] | undefined =>
  Array.isArray(raw) && raw.every(item => typeof item === 'bigint') ? raw : undefined

/**
 * One ethcall batch at one block. A failed call becomes an unavailable field.
 * Full health does not wait on discounts or non-full health.
 */
export const fetchPositionSnapshot = async ({
  chainId,
  marketId,
  userAddress,
}: {
  chainId: number
  marketId: string
  userAddress: string
}): Promise<PositionSnapshot> => {
  // requireLib types the initialized instance as the package module. The running object is ILlamalend.
  const lib = requireLib('llamaApi') as unknown as ILlamalend
  const contracts = contractsFor(marketId)
  const controller = lib.contracts[contracts.controller]?.multicallContract
  const amm = lib.contracts[contracts.amm]?.multicallContract
  const blockNumber = await lib.provider.getBlockNumber()
  const observedAt = Date.now()
  const base = {
    identity: { chainId, controller: contracts.controller, userAddress },
    blockNumber,
    observedAt,
    source: 'live' as const,
    liquidationPredicate: 'unverified' as const,
  }
  if (controller == null || amm == null) {
    const missing = unavailable('Controller or AMM multicall contract is not on the library.')
    return {
      ...base,
      loan: missing,
      debt: missing,
      collateralTokenAmount: missing,
      borrowedAssetInAmm: missing,
      oraclePrice: missing,
      lowerPrice: missing,
      upperPrice: missing,
      fullHealthPercentagePoints: missing,
      tickIndices: missing,
    }
  }

  // ethcall's generated contract methods are typed as any. The batch below is the same shape the SDK uses.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ethcall Contract methods return any
  const calls: Call[] = [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ethcall Contract methods are any
    controller.loan_exists(userAddress),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ethcall Contract methods are any
    controller.user_state(userAddress),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ethcall Contract methods are any
    controller.health(userAddress, true),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ethcall Contract methods are any
    controller.user_prices(userAddress),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ethcall Contract methods are any
    amm.price_oracle(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ethcall Contract methods are any
    amm.read_user_tick_numbers(userAddress),
  ]
  const [loanExists, userState, healthRaw, pricesRaw, oracleRaw, ticksRaw] = await lib.multicallProvider.tryAll(calls, {
    blockTag: blockNumber,
  })

  if (loanExists === false) {
    const closed = unavailable('The loan is closed.')
    return {
      ...base,
      loan: 'closed',
      debt: { status: 'value', value: decimal(0) ?? '0' },
      collateralTokenAmount: { status: 'value', value: decimal(0) ?? '0' },
      borrowedAssetInAmm: { status: 'value', value: decimal(0) ?? '0' },
      oraclePrice: decimalField(oracleRaw, 18, 'Oracle price was not returned at this block.'),
      lowerPrice: closed,
      upperPrice: closed,
      fullHealthPercentagePoints: closed,
      tickIndices: closed,
    }
  }

  const state = tupleBigints(userState)
  const collateralRaw = state?.[0]
  const borrowedRaw = state?.[1]
  const debtRaw = state?.[2]
  const prices = tupleBigints(pricesRaw)
  // The SDK reverses user_prices so index 0 is the lower boundary.
  const lowerRaw = prices?.[1]
  const upperRaw = prices?.[0]
  const ticks = tupleBigints(ticksRaw)

  return {
    ...base,
    loan: loanExists === true ? 'open' : unavailable('loan_exists was not returned at this block.'),
    debt: decimalField(debtRaw, contracts.borrowedDecimals, 'Debt was not returned at this block.'),
    collateralTokenAmount: decimalField(
      collateralRaw,
      contracts.collateralDecimals,
      'Collateral balance was not returned at this block.',
    ),
    borrowedAssetInAmm: decimalField(
      borrowedRaw,
      contracts.borrowedDecimals,
      'Borrowed-asset AMM balance was not returned at this block.',
    ),
    oraclePrice: decimalField(oracleRaw, 18, 'Oracle price was not returned at this block.'),
    lowerPrice: decimalField(lowerRaw, 18, 'Lower range boundary was not returned at this block.'),
    upperPrice: decimalField(upperRaw, 18, 'Upper range boundary was not returned at this block.'),
    fullHealthPercentagePoints: decimalField(
      typeof healthRaw === 'bigint' ? healthRaw * 100n : undefined,
      18,
      'Full health was not returned at this block.',
    ),
    tickIndices:
      ticks != null && ticks.length >= 2
        ? { status: 'value', value: [Number(ticks[0]), Number(ticks[1])] as const }
        : unavailable('Tick indices were not returned at this block.'),
  }
}
