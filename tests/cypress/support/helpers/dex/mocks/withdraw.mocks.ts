import { parseUnits, zeroAddress } from 'viem'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { oneAddress } from '@cy/support/generators'
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
import type { CurveApi } from '@evm-ui/features/connect-wallet/lib/types'
import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import { setTokenUsdRateQueryData } from '@evm-ui/queries/token-usd-rate.query'
import type { Decimal } from '@primitives/decimal.utils'

export const createWithdrawScenario = ({ approved = true, delayQuote = false, bonus = '0', wrapped = false } = {}) => {
  const chainId = 1
  const address = oneAddress()
  const lpToken = oneAddress()
  const coins = [
    { address: oneAddress(), symbol: 'USDC', decimals: 6 },
    { address: oneAddress(), symbol: 'DAI', decimals: 18 },
  ]
  const quoteReady = Promise.withResolvers<void>()
  if (!delayQuote) quoteReady.resolve()
  const quote: TestStub<[{ burn: bigint; index: number }[]], Promise<bigint[]>> = cy
    .stub()
    .callsFake(async (calls: { burn: bigint; index: number }[]) => {
      await quoteReady.promise
      return calls.map(({ burn, index }) => burn / 10n ** BigInt(18 - coins[index].decimals))
    })
  const approve = createTransactionStub([TEST_TX_HASH])
  const withdraw = createTransactionStub(TEST_TX_HASH)
  const withdrawWrapped = createTransactionStub(TEST_TX_HASH)
  const expected = cy.stub().callsFake((lpAmount: string) => Promise.resolve(lpAmount))
  const estimateGas = createStub(180_000)
  const estimateApprove = createStub(70_000)
  const pool = {
    id: 'mock-pool',
    address,
    lpToken,
    isPlain: !wrapped,
    isCrypto: false,
    gauge: { address: zeroAddress },
    underlyingCoinAddresses: coins.map(coin => coin.address),
    underlyingCoins: coins.map(coin => coin.symbol),
    underlyingDecimals: coins.map(coin => coin.decimals),
    wrappedCoinAddresses: coins.map(coin => coin.address),
    wrappedCoins: coins.map(coin => coin.symbol),
    wrappedDecimals: coins.map(coin => coin.decimals),
    curve: {
      isNoRPC: false,
      provider: { getBlockNumber: createStub(1) },
      multicallProvider: { tryAll: quote },
      contracts: {
        [address]: {
          multicallContract: { calc_withdraw_one_coin: (burn: bigint, index: number) => ({ burn, index }) },
        },
      },
    },
    stats: {
      parameters: createStub({ lpTokenSupply: '1000' }),
      underlyingBalances: createStub(['100', '100']),
      wrappedBalances: createStub(['100', '100']),
    },
    withdrawOneCoinExpected: expected,
    withdrawOneCoinWrappedExpected: expected,
    withdrawOneCoinBonus: createStub(bonus),
    withdrawOneCoinWrappedBonus: createStub(bonus),
    withdrawOneCoinIsApproved: approved ? createStub(true) : createIsApprovedStub(approve),
    withdrawOneCoinApprove: approve,
    withdrawOneCoin: withdraw,
    withdrawOneCoinWrapped: withdrawWrapped,
    estimateGas: {
      withdrawOneCoin: estimateGas,
      withdrawOneCoinWrapped: estimateGas,
      withdrawOneCoinApprove: estimateApprove,
    },
  } as unknown as PoolTemplate
  const curve = {
    chainId,
    signerAddress: TEST_ADDRESS,
    isNoRPC: false,
    getPool: createSyncStub(pool),
    getUsdRate: createStub(1),
    setCustomFeeData: createSyncStub(undefined),
  } as unknown as CurveApi
  globalLibs.set('curveApi', curve)
  ;[...coins, { address: lpToken, decimals: 18 }].forEach(({ address: tokenAddress, decimals }) => {
    seedErc20BalanceForAddresses({
      chainId,
      tokenAddress,
      addresses: [TEST_ADDRESS],
      rawBalance: parseUnits('10', decimals),
      decimals,
    })
    setTokenUsdRateQueryData({ chainId, tokenAddress }, 1)
  })
  setGasInfo({ chainId })

  return {
    curve,
    pool,
    coins,
    quote,
    withdraw,
    releaseQuote: () => quoteReady.resolve(),
    assertPreSubmit: (lpAmount: Decimal = '1.250000000000000001', index = 0) => {
      expect(withdraw.callCount).to.equal(0)
      expect(approve.callCount).to.equal(0)
      if (approved || wrapped) expect(estimateGas).to.have.been.calledWithExactly(lpAmount, index, 0.5)
      else expect(estimateApprove).to.have.been.calledWithExactly(lpAmount)
    },
    assertSubmit: (lpAmount: Decimal = '1.250000000000000001', index = 0) => {
      expect(wrapped ? withdrawWrapped : withdraw).to.have.been.calledWithExactly(lpAmount, index, 0.5)
      expect(withdraw.callCount).to.equal(wrapped ? 0 : 1)
      expect(withdrawWrapped.callCount).to.equal(wrapped ? 1 : 0)
      expect(approve.callCount).to.equal(approved || wrapped ? 0 : 1)
      if (!approved && !wrapped) expect(approve).to.have.been.calledWithExactly(lpAmount)
    },
  }
}
