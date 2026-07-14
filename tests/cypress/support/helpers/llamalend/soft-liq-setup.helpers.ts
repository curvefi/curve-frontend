import {
  createPublicClient,
  encodeFunctionData,
  http,
  numberToHex,
  parseAbi,
  parseUnits,
  type Address,
  type PublicClient,
} from 'viem'
import { loadTenderlyAccount } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { approveErc20, fundErc20 } from '@cy/support/helpers/tenderly/vnet-fund'
import { setVirtualNetworkStorageAt } from '@cy/support/helpers/tenderly/vnet-storage'
import { advanceVirtualNetworkClock } from '@cy/support/helpers/tenderly/vnet-time'
import { sendVnetTransactionAndWait } from '@cy/support/helpers/tenderly/vnet-tx'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { assert, maybe, notFalsy } from '@primitives/objects.utils'
import { setupTenderlyLoan } from './loan-setup.helpers'

const AMM_ABI = parseAbi([
  'function active_band() view returns (int256)',
  'function exchange(uint256 i, uint256 j, uint256 in_amount, uint256 min_amount) returns (uint256[2])',
  'function get_amount_for_price(uint256 p) view returns (uint256 amount, bool is_pump)',
  'function get_dxdy(uint256 i, uint256 j, uint256 in_amount) view returns (uint256, uint256)',
  'function get_p() view returns (uint256)',
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

const isSoftLiquidationState = ({ borrowed, debt }: SoftLiquidationState) => debt > 0n && borrowed > 0n

const stringifySetupDetails = (details: Record<string, unknown>) =>
  JSON.stringify(details, (_, value: unknown) => (typeof value === 'bigint' ? value.toString() : value), 2)

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

  const [price, storedObservationTimestamp, storedPrice, [, updatedAt, answer]] = await Promise.all([
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'price' }),
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'storedObservationTimestamp' }),
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'storedPrice' }),
    client.readContract({ address: oracleAddress, abi: ORACLE_ABI, functionName: 'storedResponse' }),
  ])

  return { answer, oracleAddress, price, storedObservationTimestamp, storedPrice, updatedAt }
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

const moveAmmToOraclePrice = ({
  ammAddress,
  borrowedAddress,
  collateralAddress,
  client,
  targetPrice,
  userAddress,
  vnet,
}: {
  ammAddress: Address
  borrowedAddress: Address
  collateralAddress: Address
  client: PublicClient
  targetPrice: bigint
  userAddress: Address
  vnet: CreateVirtualTestnetResponse
}) => {
  type Quote = {
    amount: bigint
    inputUsed: bigint
    isPump: boolean
    outputAmount: bigint
  }

  return cy
    .then<Quote>(LOAD_TIMEOUT, async () => {
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

      return { amount, inputUsed, isPump, outputAmount }
    })
    .then(quote => {
      if (quote.amount === 0n || quote.inputUsed === 0n || quote.outputAmount === 0n) return quote

      // Same direction as quoted above; fund and approve the actual input token for AMM.exchange.
      const [i, j] = quote.isPump ? [0n, 1n] : [1n, 0n]
      const tokenAddress = quote.isPump ? borrowedAddress : collateralAddress

      return fundErc20({
        adminRpcUrl: getRpcUrls(vnet).adminRpcUrl,
        amountWei: `0x${quote.amount.toString(16)}`,
        tokenAddress,
        recipientAddresses: [userAddress],
      }).then(() =>
        loadTenderlyAccount()
          .then(LOAD_TIMEOUT, async tenderlyAccount => {
            const tenderly = { ...tenderlyAccount, vnetId: vnet.id }
            await approveErc20({
              client,
              spenderAddress: ammAddress,
              tenderly,
              tokenAddress,
              tokenAmountWei: quote.amount,
              userAddress,
            })
            await sendVnetTransactionAndWait({
              client,
              errorMessage: 'Tenderly AMM exchange transaction failed',
              tenderly,
              tx: {
                from: userAddress,
                to: ammAddress,
                data: encodeFunctionData({ abi: AMM_ABI, functionName: 'exchange', args: [i, j, quote.amount, 0n] }),
              },
            })
          })
          .then(() => quote),
      )
    })
}

const runSoftLiquidationPriceMove = ({
  ammAddress,
  borrowedAddress,
  collateralAddress,
  client,
  controllerAddress,
  range,
  targetPrice,
  userAddress,
  vnet,
}: {
  ammAddress: Address
  borrowedAddress: Address
  collateralAddress: Address
  client: PublicClient
  controllerAddress: Address
  range: bigint
  targetPrice: Decimal
  userAddress: Address
  vnet: CreateVirtualTestnetResponse
}) =>
  cy.then(LOAD_TIMEOUT, async () => {
    const readParams = { client, controllerAddress, ammAddress, userAddress }
    const state = await readSoftLiquidationState(readParams)

    assert(state.debt > 0n, `Loan was not created before soft liq price move: ${stringifySetupDetails({ state })}`)
    assert(state.range === range, `Unpected range: ${stringifySetupDetails({ expectedRange: range, state })}`)
    assert(state.health > 0n, `Loan health is negative before soft liq price move: ${stringifySetupDetails({ state })}`)
    assert(!isSoftLiquidationState(state), `Loan is already in soft liquidation: ${stringifySetupDetails({ state })}`)

    const targetPriceWei = parseUnits(targetPrice, 18)
    const oracleBefore = await readOracleState({ client, ammAddress })
    const oracleStorageLayout = await findOracleStorageLayout({ client, oracleState: oracleBefore })
    const block = await client.getBlock()
    // The oracle wrapper smooths storedPrice toward the live Chainlink answer as time elapses.
    // Store the observation timestamp at the post-mine time so the next read uses storedPrice.
    const oracleObservationTimestamp = block.timestamp + BigInt(CLOCK_STEP_SECONDS)

    setOracleStoragePrice({
      vnet,
      oracleAddress: oracleBefore.oracleAddress,
      layout: oracleStorageLayout,
      targetPrice: targetPriceWei,
      timestamp: oracleObservationTimestamp,
    })
      .then(() => advanceVirtualNetworkClock({ vnet, seconds: CLOCK_STEP_SECONDS }))
      .then(async () => {
        const oracle = await readOracleState({ client, ammAddress })
        assert(
          oracle.answer === targetPriceWei && oracle.storedPrice === targetPriceWei,
          `Oracle storage override did not reach target: ${stringifySetupDetails({ oracle, targetPrice })}`,
        )
      })
      .then(() =>
        moveAmmToOraclePrice({
          ammAddress,
          borrowedAddress,
          collateralAddress,
          client,
          targetPrice: targetPriceWei,
          userAddress,
          vnet,
        }),
      )
      .then(async quote => {
        const { oracle, state } = await readSoftLiquidationSetup(readParams)
        assert(
          isSoftLiquidationState(state) && state.health > 0n,
          `Failed to reach soft liquidation: ${stringifySetupDetails({ oracle, quote, state, targetPrice })}`,
        )
        return state
      })
      .then(state =>
        fundErc20({
          adminRpcUrl: getRpcUrls(vnet).adminRpcUrl,
          amountWei: `0x${state.debt.toString(16)}`,
          tokenAddress: borrowedAddress,
          recipientAddresses: [userAddress],
        }),
      )
  })

/**
 * Builds a repeatable soft-liquidation state for a freshly opened LlamaLend loan.
 *
 * The Optimism llv2 markets used by these tests read the AMM oracle price from a Chainlink contract,
 * so AMM swaps alone cannot pull `price_oracle` down to the test target. We find the contract's storage slots
 * and override the Chainlink answer, stored price, and observation timestamp with the target price data.
 * Then we advance the vnet clock by `CLOCK_STEP_SECONDS` as the AMM smoothes the price oracle (EMA).
 *
 * Finally, we ask `get_amount_for_price` how much borrowed asset must be swapped through the AMM to move
 * the live pool price there. Executing that quote with `exchange` is the step that updates the user's
 * ticks and makes the controller report real position in soft-liquidation.
 */
export const setupTenderlySoftLiquidation = ({
  ammAddress,
  targetPrice,
  ...loanProps
}: Parameters<typeof setupTenderlyLoan>[0] & {
  ammAddress: Address
  borrowedAddress: Address
  targetPrice: Decimal
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
    targetPrice,
    userAddress,
    vnet,
  })
}
