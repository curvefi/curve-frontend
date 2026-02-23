import { encodeFunctionData, parseAbi, parseEther, parseUnits, type Address } from 'viem'
import { tenderlyAccount } from '@cy/support/helpers/tenderly/account'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { sendVnetTransaction } from '@cy/support/helpers/tenderly/vnet-transaction'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import type { Decimal } from '@ui-kit/utils'

const ERC20_ABI = parseAbi(['function approve(address spender, uint256 amount)'])
const ERC20_DECIMALS_ABI = parseAbi(['function decimals() view returns (uint8)'])
const CONTROLLER_ABI = parseAbi(['function create_loan(uint256 collateral, uint256 debt, uint256 N)'])

export const fundUserForLoanSetup = ({
  vnet,
  userAddress,
  collateralAddress,
  collateralAmountWei,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  collateralAddress: Address
  collateralAmountWei: bigint
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)
  // 1 ETH is enough for test transactions and keeps setup explicit.
  fundEth({ adminRpcUrl, amountWei: `0x${parseEther('1').toString(16)}`, recipientAddresses: [userAddress] })
  fundErc20({
    adminRpcUrl,
    amountWei: `0x${collateralAmountWei.toString(16)}`,
    tokenAddress: collateralAddress,
    recipientAddresses: [userAddress],
  })
}

export const approveTokenForSpender = ({
  vnet,
  userAddress,
  tokenAddress,
  spenderAddress,
  tokenAmountWei,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  tokenAddress: Address
  spenderAddress: Address
  tokenAmountWei: bigint
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: userAddress,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, tokenAmountWei],
      }),
    },
  })

export const createLoanOnController = ({
  vnet,
  userAddress,
  controllerAddress,
  collateralAmountWei,
  debtAmountWei,
  range = 10n,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  controllerAddress: Address
  collateralAmountWei: bigint
  debtAmountWei: bigint
  range?: bigint
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: userAddress,
      to: controllerAddress,
      data: encodeFunctionData({
        abi: CONTROLLER_ABI,
        functionName: 'create_loan',
        args: [collateralAmountWei, debtAmountWei, range],
      }),
    },
  })

export const setupProgrammaticLoan = ({
  vnet,
  userAddress,
  collateralAddress,
  controllerAddress,
  collateral,
  borrow,
  collateralFundingMultiplier = 2n,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  collateralAddress: Address
  controllerAddress: Address
  collateral: Decimal
  borrow: Decimal
  collateralFundingMultiplier?: bigint
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)

  return cy
    .request({
      method: 'POST',
      url: adminRpcUrl,
      headers: { 'Content-Type': 'application/json' },
      body: {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: collateralAddress,
            data: encodeFunctionData({ abi: ERC20_DECIMALS_ABI, functionName: 'decimals' }),
          },
          'latest',
        ],
        id: 1,
      },
    })
    .then(({ body }) => {
      const collateralDecimals = Number.parseInt(body.result, 16)
      const collateralWei = parseUnits(collateral, collateralDecimals)
      const borrowWei = parseUnits(borrow, 18)
      const fundedCollateral = collateralWei * collateralFundingMultiplier

      fundUserForLoanSetup({
        vnet,
        userAddress,
        collateralAddress,
        collateralAmountWei: fundedCollateral,
      })

      // Bridge async setup transactions into Cypress queue so the test waits for completion.
      return cy.then(async () => {
        await approveTokenForSpender({
          vnet,
          userAddress,
          tokenAddress: collateralAddress,
          spenderAddress: controllerAddress,
          tokenAmountWei: collateralWei,
        })
        await createLoanOnController({
          vnet,
          userAddress,
          controllerAddress,
          collateralAmountWei: collateralWei,
          debtAmountWei: borrowWei,
        })
      })
    })
}

const AMM_ABI = parseAbi(['function amm() view returns (address)'])
const AMM_COINS_ABI = parseAbi(['function coins(uint256) view returns (address)'])
const ERC20_APPROVE_ABI = parseAbi(['function approve(address spender, uint256 amount)'])
const AMM_EXCHANGE_ABI = parseAbi(['function exchange(uint256 i, uint256 j, uint256 in_amount, uint256 min_amount)'])
const CONTROLLER_USER_STATE_ABI = parseAbi(['function user_state(address) view returns (uint256, uint256, uint256)'])
const traderAddress = '0x000000000000000000000000000000000000bEEF' as Address

/**
 * Deterministic swap ladders used to force soft liquidation in tests.
 *
 * Why hardcoded:
 * - Markets differ in token decimals (6/8/18) and liquidity depth.
 * - A single amount is flaky: sometimes too small to move the position into soft liquidation.
 * - Max-size single swaps can revert or overshoot behavior depending on market state.
 * - We intentionally escalate through fixed amounts to keep behavior reproducible across runs.
 *
 * Units:
 * - CRVUSD ladder values are whole-token amounts (later scaled by token decimals).
 * - Collateral ladder values are collateral-token amounts (later scaled by token decimals).
 */
const CRVUSD_TRADE_LADDER = [
  '1000',
  '5000',
  '10000',
  '25000',
  '50000',
  '100000',
  '250000',
  '500000',
  '1000000',
  '2500000',
  '5000000',
  '10000000',
  '25000000',
  '50000000',
  '100000000',
  '250000000',
  '500000000',
  '1000000000',
]
const COLLATERAL_TRADE_LADDER = [
  '0.1',
  '0.5',
  '1',
  '5',
  '10',
  '25',
  '50',
  '100',
  '250',
  '500',
  '1000',
  '5000',
  '10000',
  '50000',
  '100000',
  '250000',
]

type RpcCall = (method: string, params: unknown[]) => Promise<string>

const createRpcCall =
  (adminRpcUrl: string): RpcCall =>
  async (method, params) => {
    const response = await fetch(adminRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }),
    })
    const rpcBody = await response.json()
    if (rpcBody.error) throw new Error(`${method} failed: ${rpcBody.error.message}`)
    return rpcBody.result as string
  }

const readAmmCoin = async (rpcCall: RpcCall, ammAddress: Address, idx: bigint) => {
  const encoded = encodeFunctionData({ abi: AMM_COINS_ABI, functionName: 'coins', args: [idx] })
  const result = await rpcCall('eth_call', [{ to: ammAddress, data: encoded }, 'latest'])
  return ('0x' + result.slice(26)) as Address
}

const readTokenDecimals = async (rpcCall: RpcCall, tokenAddress: Address) => {
  const encoded = encodeFunctionData({ abi: ERC20_DECIMALS_ABI, functionName: 'decimals' })
  const result = await rpcCall('eth_call', [{ to: tokenAddress, data: encoded }, 'latest'])
  return Number.parseInt(result, 16)
}

const readUserStablecoinInAmm = async (rpcCall: RpcCall, controllerAddress: Address, userAddress: Address) => {
  const encoded = encodeFunctionData({
    abi: CONTROLLER_USER_STATE_ABI,
    functionName: 'user_state',
    args: [userAddress],
  })
  const result = await rpcCall('eth_call', [{ to: controllerAddress, data: encoded }, 'latest'])
  return BigInt(`0x${result.slice(2).slice(64, 128)}`)
}

const tradeAmountsForInput = (decimals: number, isCrvUsd: boolean) => {
  const amounts = isCrvUsd ? CRVUSD_TRADE_LADDER : COLLATERAL_TRADE_LADDER
  return amounts.map((amount) => parseUnits(amount, decimals))
}

const seededBalance = (decimals: number, isCrvUsd: boolean) => parseUnits(isCrvUsd ? '10000000000' : '250000', decimals)

const approveToken = ({
  vnet,
  tokenAddress,
  spenderAddress,
  amount,
}: {
  vnet: CreateVirtualTestnetResponse
  tokenAddress: Address
  spenderAddress: Address
  amount: bigint
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: traderAddress,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [spenderAddress, amount],
      }),
    },
  })

const swapAmm = ({
  vnet,
  ammAddress,
  i,
  j,
  amount,
}: {
  vnet: CreateVirtualTestnetResponse
  ammAddress: Address
  i: bigint
  j: bigint
  amount: bigint
}) =>
  sendVnetTransaction({
    tenderly: { ...tenderlyAccount, vnetId: vnet.id },
    tx: {
      from: traderAddress,
      to: ammAddress,
      data: encodeFunctionData({
        abi: AMM_EXCHANGE_ABI,
        functionName: 'exchange',
        args: [i, j, amount, 0n],
      }),
    },
  })

type SwapDirection = readonly [bigint, bigint]

const retryUntilSoftLiquidation = async <T>({
  steps,
  readStablecoinInAmm,
  runStep,
}: {
  steps: readonly T[]
  readStablecoinInAmm: () => Promise<bigint>
  runStep: (step: T) => Promise<void>
}): Promise<bigint> => {
  let stablecoinInAmm = await readStablecoinInAmm()
  if (stablecoinInAmm > 0n) return stablecoinInAmm

  let idx = 0
  while (idx < steps.length && stablecoinInAmm === 0n) {
    try {
      await runStep(steps[idx])
    } catch (e) {
      // Keep trying larger swaps / alternate directions.
      console.info(`Failed to trade ${steps[idx]}: ${e.message}, retrying...`)
    }
    stablecoinInAmm = await readStablecoinInAmm()
    idx += 1
  }

  return stablecoinInAmm
}

const runTradeLadder = async ({
  vnet,
  ammAddress,
  controllerAddress,
  userAddress,
  rpcCall,
  direction,
  decimalsByIndex,
  isCrvUsdByIndex,
}: {
  vnet: CreateVirtualTestnetResponse
  ammAddress: Address
  controllerAddress: Address
  userAddress: Address
  rpcCall: RpcCall
  direction: SwapDirection
  decimalsByIndex: Record<number, number>
  isCrvUsdByIndex: Record<number, boolean>
}): Promise<bigint> => {
  const [i, j] = direction
  const inputIndex = Number(i)
  const amounts = tradeAmountsForInput(decimalsByIndex[inputIndex], isCrvUsdByIndex[inputIndex])

  return retryUntilSoftLiquidation({
    steps: amounts,
    readStablecoinInAmm: () => readUserStablecoinInAmm(rpcCall, controllerAddress, userAddress),
    runStep: (amount) => swapAmm({ vnet, ammAddress, i, j, amount }),
  })
}

const runDirectionsUntilSoftLiquidation = async ({
  vnet,
  ammAddress,
  controllerAddress,
  userAddress,
  rpcCall,
  directions,
  decimalsByIndex,
  isCrvUsdByIndex,
}: {
  vnet: CreateVirtualTestnetResponse
  ammAddress: Address
  controllerAddress: Address
  userAddress: Address
  rpcCall: RpcCall
  directions: readonly SwapDirection[]
  decimalsByIndex: Record<number, number>
  isCrvUsdByIndex: Record<number, boolean>
}): Promise<bigint> =>
  retryUntilSoftLiquidation({
    steps: directions,
    readStablecoinInAmm: () => readUserStablecoinInAmm(rpcCall, controllerAddress, userAddress),
    runStep: (direction) =>
      runTradeLadder({
        vnet,
        ammAddress,
        controllerAddress,
        userAddress,
        rpcCall,
        direction,
        decimalsByIndex,
        isCrvUsdByIndex,
      }).then(() => undefined),
  })

/**
 * Simulates soft liquidation by pushing AMM bands with real swaps until the borrower's
 * `user_state` contains a non-zero stablecoin amount in AMM.
 */
export const simulateSoftLiquidation = ({
  vnet,
  controllerAddress,
  userAddress,
  collateralAddress,
}: {
  vnet: CreateVirtualTestnetResponse
  controllerAddress: Address
  userAddress: Address
  collateralAddress: Address
}) => {
  const { adminRpcUrl } = getRpcUrls(vnet)

  return cy
    .request({
      method: 'POST',
      url: adminRpcUrl,
      headers: { 'Content-Type': 'application/json' },
      body: {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: controllerAddress, data: encodeFunctionData({ abi: AMM_ABI, functionName: 'amm' }) }, 'latest'],
        id: 1,
      },
    })
    .then(({ body }) => {
      const ammAddress = ('0x' + body.result.slice(26)) as Address

      // cy.then() here both keeps this async block in the Cypress queue and extends timeout for on-chain setup.
      return cy.then({ timeout: 120000 }, async () => {
        const rpcCall = createRpcCall(adminRpcUrl)
        const [ammCoin0, ammCoin1] = await Promise.all([
          readAmmCoin(rpcCall, ammAddress, 0n),
          readAmmCoin(rpcCall, ammAddress, 1n),
        ])
        const [ammCoin0Decimals, ammCoin1Decimals] = await Promise.all([
          readTokenDecimals(rpcCall, ammCoin0),
          readTokenDecimals(rpcCall, ammCoin1),
        ])

        const normalizedCollateral = collateralAddress.toLowerCase()
        const collateralIndex =
          ammCoin0.toLowerCase() === normalizedCollateral
            ? 0n
            : ammCoin1.toLowerCase() === normalizedCollateral
              ? 1n
              : null
        if (collateralIndex === null) {
          throw new Error(
            `Failed to force soft liquidation: collateral ${collateralAddress} is not AMM coin0=${ammCoin0} or coin1=${ammCoin1}`,
          )
        }

        const isCrvUsdByIndex: Record<number, boolean> = {
          0: ammCoin0.toLowerCase() === CRVUSD_ADDRESS.toLowerCase(),
          1: ammCoin1.toLowerCase() === CRVUSD_ADDRESS.toLowerCase(),
        }
        const decimalsByIndex: Record<number, number> = {
          0: ammCoin0Decimals,
          1: ammCoin1Decimals,
        }

        const directions: readonly SwapDirection[] =
          collateralIndex === 0n
            ? [
                [0n, 1n],
                [1n, 0n],
              ]
            : [
                [1n, 0n],
                [0n, 1n],
              ]
        const token0Balance = seededBalance(decimalsByIndex[0], isCrvUsdByIndex[0])
        const token1Balance = seededBalance(decimalsByIndex[1], isCrvUsdByIndex[1])

        await rpcCall('tenderly_setBalance', [[traderAddress], `0x${parseEther('10').toString(16)}`])
        await rpcCall('tenderly_setErc20Balance', [ammCoin0, [traderAddress], `0x${token0Balance.toString(16)}`])
        await rpcCall('tenderly_setErc20Balance', [ammCoin1, [traderAddress], `0x${token1Balance.toString(16)}`])

        await approveToken({ vnet, tokenAddress: ammCoin0, spenderAddress: ammAddress, amount: token0Balance })
        await approveToken({ vnet, tokenAddress: ammCoin1, spenderAddress: ammAddress, amount: token1Balance })

        const stablecoinInAmm = await runDirectionsUntilSoftLiquidation({
          vnet,
          ammAddress,
          controllerAddress,
          userAddress,
          rpcCall,
          directions,
          decimalsByIndex,
          isCrvUsdByIndex,
        })

        if (stablecoinInAmm === 0n) {
          throw new Error('Failed to force soft liquidation: user_state stablecoin in AMM is still zero')
        }
      })
    })
}
