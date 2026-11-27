import { BigNumber } from 'bignumber.js'
import { ethAddress, parseUnits, zeroAddress } from 'viem'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { oneAddress } from '@cy/support/generators'
import { TEST_SLIPPAGE } from '@cy/support/helpers/dex/curve.helpers'
import { TEST_ADDRESS, TEST_TX_HASH } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { seedErc20BalanceForAddresses } from '@cy/support/helpers/llamalend/query-cache.helpers'
import { setGasInfo } from '@cy/support/helpers/llamalend/test-context.helpers'
import {
  createIsApprovedStub,
  createStub,
  createSyncStub,
  createTransactionStub,
  type TestStub,
} from '@cy/support/helpers/llamalend/test-stub.utils'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import type { CurveApi } from '@evm-ui/features/connect-wallet/lib/types'
import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import { setTokenUsdRateQueryData } from '@evm-ui/queries/token-usd-rate.query'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { DEFAULT_DECIMALS } from '@primitives/units.util'
import { queryClient } from '@ui/features/queries/query-client'
import { getBalanceQueryOptions } from '@wagmi/core/query'

export const SWAP_TEST = {
  input: '1.25',
  output: '1.275',
  minimumReceived: '1.268625',
  balance: '10',
  maxOutput: '10.2',
  reserve: '100',
  rate: '1.02',
  priceImpact: '0.1',
  excessiveBalance: '11',
  excessiveReserve: '101',
  precisionOverflow: '0.0000001',
  customSlippage: '1',
  customMinimumReceived: '1.26225',
  lowRate: '0.9',
  blockedPriceImpact: '26',
  yieldBearingRate: '1.1',
  secondInput: '2.5',
  secondOutput: '2.55',
  secondMinimumReceived: '2.53725',
  stablecoinDecimals: 6,
  swapGas: 180_000,
  approveGas: 70_000,
  usdRate: 1,
} as const

type SwapExpectation = { amount?: string; from?: number; to?: number; isWrapped?: boolean; slippage?: string }

export const createSwapScenario = ({
  approved = true,
  wrapped = false,
  native = false,
  connected = true,
  balance = SWAP_TEST.balance,
  rate = SWAP_TEST.rate,
  priceImpact = SWAP_TEST.priceImpact,
  storedRates = ['1', '1', '1'],
  delayQuote = false,
}: {
  approved?: boolean
  wrapped?: boolean
  native?: boolean
  connected?: boolean
  balance?: Decimal
  rate?: Decimal
  priceImpact?: Decimal
  storedRates?: Decimal[]
  delayQuote?: boolean
} = {}) => {
  const chainId = Chain.Ethereum
  const coins = [
    {
      address: native ? ethAddress : oneAddress(),
      symbol: native ? 'ETH' : 'USDC',
      decimals: native ? DEFAULT_DECIMALS : SWAP_TEST.stablecoinDecimals,
    },
    { address: oneAddress(), symbol: 'DAI', decimals: DEFAULT_DECIMALS },
    { address: oneAddress(), symbol: 'USDT', decimals: SWAP_TEST.stablecoinDecimals },
  ]
  const wrappedCoins = wrapped
    ? [
        { address: oneAddress(), symbol: 'wUSDC', decimals: DEFAULT_DECIMALS },
        { address: oneAddress(), symbol: '3CRV', decimals: DEFAULT_DECIMALS },
      ]
    : coins
  const quoteReady = Promise.withResolvers<void>()
  if (!delayQuote) quoteReady.resolve()
  const methods = [coins, wrappedCoins].map(tokens => {
    const approve = createTransactionStub([TEST_TX_HASH])
    return {
      expected: cy.stub().callsFake(async (from: number, to: number, amount: Decimal) => {
        await quoteReady.promise
        return new BigNumber(amount)
          .times(from === 0 ? rate : 1)
          .div(to === 0 ? rate : 1)
          .decimalPlaces(tokens[to].decimals, BigNumber.ROUND_FLOOR)
          .toFixed()
      }) as TestStub<[number, number, Decimal], Promise<Decimal>>,
      required: cy.stub().callsFake(async (from: number, to: number, amount: Decimal) => {
        await quoteReady.promise
        return new BigNumber(amount)
          .times(to === 0 ? rate : 1)
          .div(from === 0 ? rate : 1)
          .decimalPlaces(tokens[from].decimals, BigNumber.ROUND_CEIL)
          .toFixed()
      }) as TestStub<[number, number, Decimal], Promise<Decimal>>,
      priceImpact: createStub(priceImpact),
      isApproved: approved || native ? createStub(true) : createIsApprovedStub(approve),
      approve,
      swap: createTransactionStub(TEST_TX_HASH),
      estimateGas: createStub(SWAP_TEST.swapGas),
      estimateApprove: createStub(SWAP_TEST.approveGas),
    }
  })
  const pool = {
    id: 'mock-swap-pool',
    address: oneAddress(),
    lpToken: oneAddress(),
    isPlain: !wrapped,
    isCrypto: false,
    gauge: { address: zeroAddress },
    underlyingCoinAddresses: coins.map(coin => coin.address),
    underlyingCoins: coins.map(coin => coin.symbol),
    underlyingDecimals: coins.map(coin => coin.decimals),
    wrappedCoinAddresses: wrappedCoins.map(coin => coin.address),
    wrappedCoins: wrappedCoins.map(coin => coin.symbol),
    wrappedDecimals: wrappedCoins.map(coin => coin.decimals),
    curve: { isNoRPC: false },
    stats: {
      underlyingBalances: createStub(coins.map(() => SWAP_TEST.reserve)),
      wrappedBalances: createStub(wrappedCoins.map(() => SWAP_TEST.reserve)),
    },
    getStoredRates: createStub(storedRates),
    ...Object.fromEntries(
      methods.flatMap((method, index) =>
        Object.entries({
          [`swap${index ? 'Wrapped' : ''}Expected`]: method.expected,
          [`swap${index ? 'Wrapped' : ''}Required`]: method.required,
          [`swap${index ? 'Wrapped' : ''}PriceImpact`]: method.priceImpact,
          [`swap${index ? 'Wrapped' : ''}IsApproved`]: method.isApproved,
          [`swap${index ? 'Wrapped' : ''}Approve`]: method.approve,
          [`swap${index ? 'Wrapped' : ''}`]: method.swap,
        }),
      ),
    ),
    estimateGas: Object.fromEntries(
      methods.flatMap((method, index) =>
        Object.entries({
          [`swap${index ? 'Wrapped' : ''}`]: method.estimateGas,
          [`swap${index ? 'Wrapped' : ''}Approve`]: method.estimateApprove,
        }),
      ),
    ),
  } as unknown as PoolTemplate
  const curve = {
    chainId,
    signerAddress: connected ? TEST_ADDRESS : undefined,
    isNoRPC: false,
    getPool: createSyncStub(pool),
    getUsdRate: createStub(SWAP_TEST.usdRate),
    setCustomFeeData: createSyncStub(undefined),
  } as unknown as CurveApi
  globalLibs.set('curveApi', curve)
  ;[...coins, ...wrappedCoins, { address: pool.lpToken, decimals: DEFAULT_DECIMALS }].forEach(
    ({ address, decimals }) => {
      if (address === ethAddress) {
        const { queryKey } = getBalanceQueryOptions(mockedWagmiConfig, { chainId, address: TEST_ADDRESS })
        queryClient.setQueryData(queryKey, { value: parseUnits(balance, decimals), decimals, symbol: 'ETH' })
      } else {
        seedErc20BalanceForAddresses({
          chainId,
          tokenAddress: address as `0x${string}`,
          addresses: [TEST_ADDRESS],
          rawBalance: parseUnits(balance, decimals),
          decimals,
        })
      }
      setTokenUsdRateQueryData({ chainId, tokenAddress: address }, SWAP_TEST.usdRate)
    },
  )
  setGasInfo({ chainId })

  return {
    curve,
    pool,
    coins,
    wrappedCoins,
    methods,
    releaseQuote: () => quoteReady.resolve(),
    assertPreSubmit: ({
      amount = SWAP_TEST.input,
      from = 0,
      to = 1,
      isWrapped = false,
      slippage = TEST_SLIPPAGE,
    }: SwapExpectation = {}) => {
      const method = methods[+isWrapped]
      methods.forEach(({ swap, approve }) => {
        expect(swap.callCount).to.equal(0)
        expect(approve.callCount).to.equal(0)
      })
      expect(method.expected).to.have.been.calledWithExactly(from, to, amount)
      expect(method.priceImpact).to.have.been.calledWithExactly(from, to, amount)
      expect(method.isApproved).to.have.been.calledWithExactly(from, amount)
      if (approved || native) expect(method.estimateGas).to.have.been.calledWithExactly(from, to, amount, +slippage)
      else expect(method.estimateApprove).to.have.been.calledWithExactly(from, amount)
    },
    assertSubmit: ({
      amount = SWAP_TEST.input,
      from = 0,
      to = 1,
      isWrapped = false,
      slippage = TEST_SLIPPAGE,
    }: SwapExpectation = {}) => {
      const method = methods[+isWrapped]
      expect(method.swap.callCount).to.equal(1)
      expect(method.swap).to.have.been.calledWithExactly(from, to, amount, +slippage)
      expect(method.approve.callCount).to.equal(approved || native ? 0 : 1)
      if (!approved && !native) expect(method.approve).to.have.been.calledWithExactly(from, amount)
      expect(methods[+!isWrapped].swap.callCount).to.equal(0)
      expect(methods[+!isWrapped].approve.callCount).to.equal(0)
    },
  }
}
