import {
  createPublicClient,
  encodeFunctionData,
  http,
  maxUint256,
  numberToHex,
  parseAbi,
  parseUnits,
  type Address,
  type PublicClient,
} from 'viem'
import { loadTenderlyAccount, type TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { approveErc20, fundErc20 } from '@cy/support/helpers/tenderly/vnet-fund'
import { setVirtualNetworkStorageAt } from '@cy/support/helpers/tenderly/vnet-storage'
import { advanceVirtualNetworkClock } from '@cy/support/helpers/tenderly/vnet-time'
import { sendVnetTransactionAndWait } from '@cy/support/helpers/tenderly/vnet-tx'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { assert, maybe, notFalsy } from '@primitives/objects.utils'
import { setupTenderlyLoan } from './loan-setup.helpers'

const AMM_ABI = parseAbi([
  'function active_band() view returns (int256)',
  'function exchange(uint256 i, uint256 j, uint256 in_amount, uint256 min_amount) returns (uint256[2])',
  'function get_amount_for_price(uint256 p) view returns (uint256 amount, bool is_pump)',
  'function get_dxdy(uint256 i, uint256 j, uint256 in_amount) view returns (uint256, uint256)',
  'function get_p() view returns (uint256)',
  'function p_oracle_down(int256 n) view returns (uint256)',
  'function p_oracle_up(int256 n) view returns (uint256)',
  'function price_oracle() view returns (uint256)',
  'function price_oracle_contract() view returns (address)',
  'function read_user_tick_numbers(address user) view returns (int256[2])',
])

const CONTROLLER_ABI = parseAbi([
  'function health(address user, bool full) view returns (int256)',
  'function user_prices(address user) view returns (uint256[2])',
  'function user_state(address user) view returns (uint256[4])',
])

const ORACLE_ABI = parseAbi([
  'function INTERVAL() view returns (uint256)',
  'function price() view returns (uint256)',
  'function storedObservationTimestamp() view returns (uint256)',
  'function storedPrice() view returns (uint256)',
  'function storedResponse() view returns (uint80 roundId, uint128 updatedAt, uint256 answer)',
])

const CLOCK_STEP_SECONDS = 60 * 10 // 10 minutes
const ORACLE_STORAGE_SCAN_SLOT_COUNT = 32

type SoftLiquidationReadParams = {
  client: PublicClient
  controllerAddress: Address
  ammAddress: Address
  userAddress: Address
}

type SoftLiquidationState = {
  activeBand: bigint
  collateral: bigint
  borrowed: bigint
  debt: bigint
  health: bigint
  n1: bigint
  n2: bigint
  oraclePrice: bigint
  price: bigint
  range: bigint
  userPrices: readonly [bigint, bigint]
}

type OracleState = {
  answer: bigint
  interval: bigint
  oracleAddress: Address
  price: bigint
  storedObservationTimestamp: bigint
  storedPrice: bigint
  updatedAt: bigint
}

type OracleStorageLayout = {
  answerSlot?: bigint
  storedObservationTimestampSlot?: bigint
  storedPriceSlot: bigint
}

type AmmPriceMoveQuote = {
  amount: bigint
  inputUsed: bigint
  isPump: boolean
  outputAmount: bigint
}

const isSoftLiquidationState = ({ borrowed, debt }: SoftLiquidationState) => debt > 0n && borrowed > 0n

const stringifySetupDetails = (details: Record<string, unknown>) =>
  JSON.stringify(details, (_, value: unknown) => (typeof value === 'bigint' ? value.toString() : value), 2)

const getObservationTimestamp = (timestamp: bigint, interval: bigint) => {
  assert(interval > 0n, `Oracle interval must be positive: ${interval}`)
  return (timestamp / interval) * interval
}

const alignToObservationBoundary = (timestamp: bigint, interval: bigint) => {
  const currentObservation = getObservationTimestamp(timestamp, interval)
  return currentObservation === timestamp ? timestamp : currentObservation + interval
}

const getBandMidPrice = async ({
  ammAddress,
  band,
  client,
}: Pick<SoftLiquidationReadParams, 'client' | 'ammAddress'> & { band: bigint }) => {
  const [pUp, pDown] = await Promise.all([
    client.readContract({ address: ammAddress, abi: AMM_ABI, functionName: 'p_oracle_up', args: [band] }),
    client.readContract({ address: ammAddress, abi: AMM_ABI, functionName: 'p_oracle_down', args: [band] }),
  ])

  return (pUp + pDown) / 2n
}

const getSoftLiquidationTargetPrice = async ({
  ammAddress,
  client,
  state,
}: Pick<SoftLiquidationReadParams, 'client' | 'ammAddress'> & { state: SoftLiquidationState }) => {
  const targetBand = state.n1

  assert(
    targetBand <= state.n2,
    `Unable to choose soft liquidation target band: ${stringifySetupDetails({ state, targetBand })}`,
  )

  return {
    targetBand,
    targetPrice: await getBandMidPrice({ ammAddress, band: targetBand, client }),
  }
}

const readSoftLiquidationState = async ({
  client,
  controllerAddress,
  ammAddress,
  userAddress,
}: SoftLiquidationReadParams) => {
  const [[collateral, borrowed, debt, range], userPrices, price, oraclePrice, activeBand, [n1, n2]] = await Promise.all(
    [
      client.readContract({
        address: controllerAddress,
        abi: CONTROLLER_ABI,
        functionName: 'user_state',
        args: [userAddress],
      }),
      client.readContract({
        address: controllerAddress,
        abi: CONTROLLER_ABI,
        functionName: 'user_prices',
        args: [userAddress],
      }),
      client.readContract({ address: ammAddress, abi: AMM_ABI, functionName: 'get_p' }),
      client.readContract({ address: ammAddress, abi: AMM_ABI, functionName: 'price_oracle' }),
      client.readContract({ address: ammAddress, abi: AMM_ABI, functionName: 'active_band' }),
      client.readContract({
        address: ammAddress,
        abi: AMM_ABI,
        functionName: 'read_user_tick_numbers',
        args: [userAddress],
      }),
    ],
  )
  const health =
    debt > 0n
      ? await client.readContract({
          address: controllerAddress,
          abi: CONTROLLER_ABI,
          functionName: 'health',
          args: [userAddress, false],
        })
      : 0n

  return { activeBand, borrowed, collateral, debt, health, n1, n2, oraclePrice, price, range, userPrices }
}

const readOracleState = async ({ client, ammAddress }: Pick<SoftLiquidationReadParams, 'client' | 'ammAddress'>) => {
  const oracleAddress = await client.readContract({
    address: ammAddress,
    abi: AMM_ABI,
    functionName: 'price_oracle_contract',
  })

  const [interval, price, storedObservationTimestamp, storedPrice, [, updatedAt, answer]] = await Promise.all([
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'INTERVAL' }),
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'price' }),
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'storedObservationTimestamp' }),
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'storedPrice' }),
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'storedResponse' }),
  ])

  return { answer, interval, oracleAddress, price, storedObservationTimestamp, storedPrice, updatedAt }
}

const readSoftLiquidationSetup = async (params: SoftLiquidationReadParams) => {
  const [state, oracle] = await Promise.all([readSoftLiquidationState(params), readOracleState(params)])
  return { oracle, state }
}

const prepareBorrowedForSoftLiquidationActions = ({
  borrowedAddress,
  borrowedAmountWei,
  client,
  controllerAddress,
  userAddress,
  vnet,
}: Pick<SoftLiquidationReadParams, 'client' | 'controllerAddress' | 'userAddress'> & {
  borrowedAddress: Address
  borrowedAmountWei: bigint
  vnet: CreateVirtualTestnetResponse
}) => {
  fundErc20({
    adminRpcUrl: getRpcUrls(vnet).adminRpcUrl,
    amountWei: `0x${borrowedAmountWei.toString(16)}`,
    tokenAddress: borrowedAddress,
    recipientAddresses: [userAddress],
  })

  return loadTenderlyAccount().then(LOAD_TIMEOUT, tenderlyAccount =>
    approveErc20({
      client,
      spenderAddress: controllerAddress,
      tenderly: { ...tenderlyAccount, vnetId: vnet.id },
      tokenAddress: borrowedAddress,
      tokenAmountWei: borrowedAmountWei,
      userAddress,
    }),
  )
}

const findOracleStorageLayout = async ({ client, oracleState }: { client: PublicClient; oracleState: OracleState }) => {
  const slots = Array.from({ length: ORACLE_STORAGE_SCAN_SLOT_COUNT }, (_, index) => BigInt(index))
  const slotValues = await Promise.all(
    slots.map(async slot => {
      const value = await client.getStorageAt({
        address: oracleState.oracleAddress,
        slot: numberToHex(slot, { size: 32 }),
      })
      return [slot, value ? BigInt(value) : 0n] as const
    }),
  )
  const findSlot = (expected: bigint) => slotValues.find(([, value]) => value === expected)?.[0]
  const answerSlot = findSlot(oracleState.answer)
  const storedObservationTimestampSlot = findSlot(oracleState.storedObservationTimestamp)
  const storedPriceSlot = findSlot(oracleState.storedPrice)

  if (storedPriceSlot === undefined) {
    // for some unknown reason assert() doens't work?
    throw new Error(
      `Unable to locate storedPrice storage slot: ${stringifySetupDetails({
        candidateSlots: { answerSlot, storedObservationTimestampSlot },
        oracle: oracleState,
        scannedSlots: slotValues.map(([slot, value]) => ({ slot, value })),
      })}`,
    )
  }

  return { answerSlot, storedObservationTimestampSlot, storedPriceSlot }
}

const setOracleStoragePrice = ({
  vnet,
  oracleAddress,
  layout,
  targetPrice,
  timestamp,
}: {
  vnet: CreateVirtualTestnetResponse
  oracleAddress: Address
  layout: OracleStorageLayout
  targetPrice: bigint
  timestamp: bigint
}) => {
  const writes = notFalsy(
    maybe(layout.answerSlot, slot => ({ slot, value: targetPrice })),
    { slot: layout.storedPriceSlot, value: targetPrice },
    maybe(layout.storedObservationTimestampSlot, slot => ({ slot, value: timestamp })),
  )

  return writes.reduce<Cypress.Chainable>(
    (chain, { slot, value }) =>
      chain.then(() =>
        setVirtualNetworkStorageAt({
          vnet,
          contractAddress: oracleAddress,
          slot: numberToHex(slot, { size: 32 }),
          value: numberToHex(value, { size: 32 }),
        }),
      ),
    cy.wrap(undefined, { log: false }),
  )
}

const prepareAmmPriceMove = ({
  ammAddress,
  borrowedAddress,
  collateralAddress,
  client,
  userAddress,
  vnet,
}: {
  ammAddress: Address
  borrowedAddress: Address
  collateralAddress: Address
  client: PublicClient
  userAddress: Address
  vnet: CreateVirtualTestnetResponse
}) =>
  loadTenderlyAccount().then(LOAD_TIMEOUT, async tenderlyAccount => {
    const tenderly = { ...tenderlyAccount, vnetId: vnet.id }

    // The pinned oracle can change the required swap direction, so approve both inputs before aligning the clock.
    for (const tokenAddress of [borrowedAddress, collateralAddress]) {
      await approveErc20({
        client,
        spenderAddress: ammAddress,
        tenderly,
        tokenAddress,
        tokenAmountWei: maxUint256,
        userAddress,
      })
    }

    return tenderly
  })

const quoteAmmPriceMove = async ({
  ammAddress,
  client,
  targetPrice,
}: {
  ammAddress: Address
  client: PublicClient
  targetPrice: bigint
}) => {
  const [amount, isPump] = await client.readContract({
    address: ammAddress,
    abi: AMM_ABI,
    functionName: 'get_amount_for_price',
    args: [targetPrice],
  })
  // get_amount_for_price reports the swap direction needed to move AMM price to target:
  // pump swaps borrowed -> collateral (coin 0 -> 1), otherwise collateral -> borrowed (coin 1 -> 0).
  const [i, j] = isPump ? [0n, 1n] : [1n, 0n]
  const [inputUsed, outputAmount] = await client.readContract({
    address: ammAddress,
    abi: AMM_ABI,
    functionName: 'get_dxdy',
    args: [i, j, amount],
  })
  const quote = { amount, inputUsed, isPump, outputAmount }

  assert(
    amount > 0n && inputUsed > 0n && outputAmount > 0n,
    `AMM returned an empty soft-liquidation quote: ${stringifySetupDetails({ quote, targetPrice })}`,
  )

  return quote
}

const executePreparedAmmPriceMove = ({
  ammAddress,
  borrowedAddress,
  collateralAddress,
  client,
  targetPrice,
  tenderly,
  userAddress,
  vnet,
}: {
  ammAddress: Address
  borrowedAddress: Address
  collateralAddress: Address
  client: PublicClient
  targetPrice: bigint
  tenderly: TenderlyConfig
  userAddress: Address
  vnet: CreateVirtualTestnetResponse
}) => {
  let quote: AmmPriceMoveQuote

  return cy
    .then<AmmPriceMoveQuote>(
      LOAD_TIMEOUT,
      async () => (quote = await quoteAmmPriceMove({ ammAddress, client, targetPrice })),
    )
    .then(LOAD_TIMEOUT, () => {
      // `amount` is the input requested by get_amount_for_price; inputUsed only validates get_dxdy produced a real quote.
      const tokenAddress = quote.isPump ? borrowedAddress : collateralAddress
      return fundErc20({
        adminRpcUrl: getRpcUrls(vnet).adminRpcUrl,
        amountWei: `0x${quote.amount.toString(16)}`,
        tokenAddress,
        recipientAddresses: [userAddress],
      })
    })
    .then(LOAD_TIMEOUT, async () => {
      const [i, j] = quote.isPump ? [0n, 1n] : [1n, 0n]

      await sendVnetTransactionAndWait({
        client,
        errorMessage: 'Tenderly AMM exchange transaction failed',
        tenderly,
        tx: {
          from: userAddress,
          to: ammAddress,
          data: encodeFunctionData({
            abi: AMM_ABI,
            functionName: 'exchange',
            args: [i, j, quote.amount, 0n],
          }),
        },
      })

      return quote
    })
}

const runSoftLiquidationPriceMove = ({
  ammAddress,
  borrowedAddress,
  collateralAddress,
  client,
  controllerAddress,
  range,
  userAddress,
  vnet,
}: {
  ammAddress: Address
  borrowedAddress: Address
  collateralAddress: Address
  client: PublicClient
  controllerAddress: Address
  range: bigint
  userAddress: Address
  vnet: CreateVirtualTestnetResponse
}) =>
  cy
    .then(LOAD_TIMEOUT, async () => {
      const readParams = { client, controllerAddress, ammAddress, userAddress }
      const state = await readSoftLiquidationState(readParams)

      assert(state.debt > 0n, `Loan was not created before soft liq price move: ${stringifySetupDetails({ state })}`)
      assert(state.range === range, `Unpected range: ${stringifySetupDetails({ expectedRange: range, state })}`)
      assert(
        state.health > 0n,
        `Loan health is negative before soft liq price move: ${stringifySetupDetails({ state })}`,
      )
      assert(!isSoftLiquidationState(state), `Loan is already in soft liquidation: ${stringifySetupDetails({ state })}`)

      const { targetBand, targetPrice } = await getSoftLiquidationTargetPrice({
        ammAddress,
        client,
        state,
      })
      const oracleBefore = await readOracleState({ client, ammAddress })
      const oracleStorageLayout = await findOracleStorageLayout({ client, oracleState: oracleBefore })

      return { oracleBefore, oracleStorageLayout, readParams, targetBand, targetPrice }
    })
    .then(context =>
      prepareAmmPriceMove({
        ammAddress,
        borrowedAddress,
        collateralAddress,
        client,
        userAddress,
        vnet,
      }).then(tenderly => ({ ...context, tenderly })),
    )
    .then(context =>
      cy.then(LOAD_TIMEOUT, async () => {
        const block = await client.getBlock()
        const observationTimestamp = alignToObservationBoundary(
          block.timestamp + BigInt(CLOCK_STEP_SECONDS),
          context.oracleBefore.interval,
        )
        const advanceSeconds = observationTimestamp - block.timestamp
        const clockAdvanceSeconds = Number(advanceSeconds)

        assert(
          clockAdvanceSeconds > 0 && BigInt(clockAdvanceSeconds) === advanceSeconds,
          `Invalid oracle clock advance: ${stringifySetupDetails({
            advanceSeconds,
            blockTimestamp: block.timestamp,
            interval: context.oracleBefore.interval,
            observationTimestamp,
          })}`,
        )

        return { ...context, clockAdvanceSeconds, observationTimestamp }
      }),
    )
    .then(context => advanceVirtualNetworkClock({ vnet, seconds: context.clockAdvanceSeconds }).then(() => context))
    .then(context =>
      cy.then(LOAD_TIMEOUT, async () => {
        const block = await client.getBlock()
        const currentObservation = getObservationTimestamp(block.timestamp, context.oracleBefore.interval)

        assert(
          currentObservation === context.observationTimestamp,
          `Virtual network did not reach the target oracle observation: ${stringifySetupDetails({
            blockTimestamp: block.timestamp,
            currentObservation,
            interval: context.oracleBefore.interval,
            targetObservation: context.observationTimestamp,
          })}`,
        )

        return context
      }),
    )
    .then(context =>
      setOracleStoragePrice({
        vnet,
        oracleAddress: context.oracleBefore.oracleAddress,
        layout: context.oracleStorageLayout,
        targetPrice: context.targetPrice,
        timestamp: context.observationTimestamp,
      }).then(() => context),
    )
    .then(context =>
      cy.then(LOAD_TIMEOUT, async () => {
        const [block, oracle] = await Promise.all([client.getBlock(), readOracleState({ client, ammAddress })])
        const currentObservation = getObservationTimestamp(block.timestamp, oracle.interval)

        assert(
          currentObservation === context.observationTimestamp &&
            oracle.answer === context.targetPrice &&
            oracle.price === context.targetPrice &&
            oracle.storedObservationTimestamp === context.observationTimestamp &&
            oracle.storedPrice === context.targetPrice,
          `Oracle storage override did not pin the target observation: ${stringifySetupDetails({
            blockTimestamp: block.timestamp,
            currentObservation,
            oracle,
            targetBand: context.targetBand,
            targetObservation: context.observationTimestamp,
            targetPrice: context.targetPrice,
          })}`,
        )

        return context
      }),
    )
    .then(context =>
      executePreparedAmmPriceMove({
        ammAddress,
        borrowedAddress,
        collateralAddress,
        client,
        targetPrice: context.targetPrice,
        tenderly: context.tenderly,
        userAddress,
        vnet,
      }).then(quote => ({ ...context, quote })),
    )
    .then(context =>
      cy.then(LOAD_TIMEOUT, async () => {
        const [block, { oracle, state }] = await Promise.all([
          client.getBlock(),
          readSoftLiquidationSetup(context.readParams),
        ])
        const currentObservation = getObservationTimestamp(block.timestamp, oracle.interval)

        assert(
          currentObservation === context.observationTimestamp &&
            oracle.answer === context.targetPrice &&
            oracle.price === context.targetPrice &&
            oracle.storedObservationTimestamp === context.observationTimestamp &&
            oracle.storedPrice === context.targetPrice,
          `Oracle left the pinned observation during the AMM exchange: ${stringifySetupDetails({
            blockTimestamp: block.timestamp,
            currentObservation,
            oracle,
            targetObservation: context.observationTimestamp,
            targetPrice: context.targetPrice,
          })}`,
        )
        assert(
          isSoftLiquidationState(state) && state.health > 0n,
          `Failed to reach soft liquidation: ${stringifySetupDetails({
            oracle,
            quote: context.quote,
            state,
            targetBand: context.targetBand,
            targetPrice: context.targetPrice,
          })}`,
        )

        return state
      }),
    )
    .then(state =>
      fundErc20({
        adminRpcUrl: getRpcUrls(vnet).adminRpcUrl,
        amountWei: `0x${state.debt.toString(16)}`,
        tokenAddress: borrowedAddress,
        recipientAddresses: [userAddress],
      }),
    )

/**
 * Builds a repeatable soft-liquidation state for a freshly opened LlamaLend loan.
 *
 * The Optimism llv2 markets used by these tests read the AMM oracle price from a Chainlink contract,
 * so AMM swaps alone cannot pull `price_oracle` down to the test target. We find the contract's storage slots
 * and read its observation interval. We prepare the AMM exchange, advance to an aligned observation boundary,
 * and override the Chainlink answer, stored price, and observation timestamp with the target price data.
 *
 * Executing the prepared quote with `exchange` in that same observation interval updates the user's ticks
 * and makes the controller report a real position in soft-liquidation without allowing the EMA to drift.
 */
export const setupTenderlySoftLiquidation = ({
  ammAddress,
  ...loanProps
}: Parameters<typeof setupTenderlyLoan>[0] & {
  ammAddress: Address
  borrowedAddress: Address
}) => {
  const { vnet, borrowedAddress, collateralAddress, controllerAddress, userAddress } = loanProps
  const { publicRpcUrl } = getRpcUrls(vnet)
  const client = createPublicClient({ transport: http(publicRpcUrl) })

  setupTenderlyLoan(loanProps)

  prepareBorrowedForSoftLiquidationActions({
    borrowedAddress,
    borrowedAmountWei: parseUnits(loanProps.borrow, loanProps.borrowedDecimals) * 2n,
    client,
    controllerAddress,
    userAddress,
    vnet,
  })

  runSoftLiquidationPriceMove({
    ammAddress,
    borrowedAddress,
    collateralAddress,
    client,
    controllerAddress,
    range: loanProps.range,
    userAddress,
    vnet,
  })
}
