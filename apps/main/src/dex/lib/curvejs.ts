import type { FormValues as PoolSwapFormValues } from '@/dex/components/PagePool/Swap/types'
import type { ExchangeRate, FormValues, Route, SearchedParams } from '@/dex/components/PageRouterSwap/types'
import { ChainId, ClaimableReward, CurveApi, EstimatedGas, Provider } from '@/dex/types/main.types'
import { fulfilledValue } from '@/dex/utils'
import {
  _parseRoutesAndOutput,
  excludeLowExchangeRateCheck,
  getExchangeRates,
  getSwapIsLowExchangeRate,
  routerGetToStoredRate,
} from '@/dex/utils/utilsSwap'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { getGasConfig } from '@evm-ui/queries/gas-info.query'
import { isValidAddress } from '@evm-ui/utils'
import { waitForTransaction, waitForTransactions } from '@evm-ui/utils/ethers'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import { log } from '@ui/lib/logging'

type Pool = PoolTemplate

const helpers = { waitForTransaction, waitForTransactions }

const USE_API = true

export const fetchNewPools = async (curve: CurveApi) =>
  await Promise.all([
    curve.factory.fetchNewPools(),
    curve.cryptoFactory.fetchNewPools(),
    curve.twocryptoFactory.fetchNewPools(),
    curve.tricryptoFactory.fetchNewPools(),
    curve.stableNgFactory.fetchNewPools(),
  ])

export const fetchPools = async (curve: CurveApi) => {
  await Promise.all([
    curve.factory.fetchPools(USE_API),
    curve.cryptoFactory.fetchPools(USE_API),
    curve.twocryptoFactory.fetchPools(USE_API),
    curve.crvUSDFactory.fetchPools(USE_API),
    curve.tricryptoFactory.fetchPools(USE_API),
    curve.stableNgFactory.fetchPools(USE_API),
  ])

  if (!curve.isNoRPC) {
    await fetchNewPools(curve)
  }
}

// curve
const network = {
  getTVL: (curve: CurveApi) => {
    log('getChainTVL', curve.chainId)
    return curve.getTVL()
  },
  getVolume: (curve: CurveApi) => {
    log('getChainVolume', curve.chainId)
    return curve.getVolume()
  },
}

const router = {
  routesAndOutput: async (
    activeKey: string,
    curve: CurveApi,
    formValues: FormValues,
    searchedParams: SearchedParams,
  ) => {
    const { isFrom, fromAmount, toAmount } = formValues
    const { fromAddress, toAddress } = searchedParams
    log('routesAndOutput', isFrom, fromAddress, fromAmount, toAddress, toAmount)
    let resp = {
      activeKey,
      exchangeRates: [] as string[],
      isExchangeRateLow: false,
      isHighSlippage: false,
      isStableswapRoute: false,
      priceImpact: 0,
      routes: [] as Route[],
      toAmount: '',
      toAmountOutput: '',
      fromAmount: '',
      error: '',
      fetchedToAmount: '',
    }

    try {
      // get routes and to amount
      if (isFrom) {
        // MUST CALL getBestRouteAndOutput first
        const { route: routes, output } = await curve.router.getBestRouteAndOutput(fromAddress, toAddress, fromAmount)

        if (Array.isArray(routes) && routes.length === 0 && +output === 0) return resp

        const [fetchedToAmount, priceImpact, toStoredRate] = await Promise.all([
          curve.router.expected(fromAddress, toAddress, fromAmount),
          curve.router.priceImpact(fromAddress, toAddress, fromAmount),
          routerGetToStoredRate(routes, curve, toAddress),
        ])

        resp = {
          ...resp,
          ..._parseRoutesAndOutput(
            curve,
            routes,
            priceImpact,
            output,
            fetchedToAmount,
            toAddress,
            toStoredRate,
            fromAmount,
            fromAddress,
          ),
        }
      } else {
        const fetchedFromAmount = await curve.router.required(fromAddress, toAddress, toAmount)

        // MUST CALL getBestRouteAndOutput first
        const { route: routes, output } = await curve.router.getBestRouteAndOutput(
          fromAddress,
          toAddress,
          fetchedFromAmount,
        )

        if (Array.isArray(routes) && routes.length === 0 && +output === 0) return resp

        const [fetchedToAmount, priceImpact, toStoredRate] = await Promise.all([
          curve.router.expected(fromAddress, toAddress, fetchedFromAmount),
          curve.router.priceImpact(fromAddress, toAddress, fetchedFromAmount),
          routerGetToStoredRate(routes, curve, toAddress),
        ])

        resp = {
          ...resp,
          ..._parseRoutesAndOutput(
            curve,
            routes,
            priceImpact,
            output,
            toAmount,
            toAddress,
            toStoredRate,
            fetchedFromAmount,
            fromAddress,
            fetchedToAmount,
          ),
        }
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-swap-exchange-and-output')
      return resp
    }
  },
  estGasApproval: async (
    activeKey: string,
    curve: CurveApi,
    fromAddress: string,
    toAddress: string,
    fromAmount: string,
    slippageTolerance: string,
    isApprovalCheckOnly?: boolean,
  ) => {
    log('routerEstGasApproval', fromAddress, toAddress, fromAmount, slippageTolerance)
    const resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
    try {
      resp.isApproved = await curve.router.isApproved(fromAddress, fromAmount)
      if (!isApprovalCheckOnly) {
        resp.estimatedGas = resp.isApproved
          ? await (
              curve.router.estimateGas.swap as (
                inputCoin: string,
                outputCoin: string,
                amount: string | number,
                slippage?: number,
              ) => Promise<EstimatedGas>
            )(fromAddress, toAddress, fromAmount, +slippageTolerance)
          : await curve.router.estimateGas.approve(fromAddress, fromAmount)
      }
      warnIncorrectEstGas(curve.chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  swapApprove: async (
    activeKey: string,
    curve: CurveApi,
    provider: Provider,
    fromAddress: string,
    fromAmount: string,
  ) => {
    log('swapApprove', fromAddress, fromAmount)
    const api = curve
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await api.router.approve(fromAddress, fromAmount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  swap: async (
    activeKey: string,
    curve: CurveApi,
    provider: Provider,
    fromAddress: string,
    fromAmount: string,
    toAddress: string,
    slippageTolerance: string,
  ) => {
    log('swap', fromAddress, fromAmount, toAddress, slippageTolerance)
    const resp = { activeKey, hash: '', swappedAmount: '', error: '' }
    try {
      const contractTransaction = await curve.router.swap(fromAddress, toAddress, fromAmount, +slippageTolerance)
      if (contractTransaction) {
        await helpers.waitForTransaction(contractTransaction.hash, provider)
        resp.swappedAmount = await curve.router.getSwappedAmount(contractTransaction, toAddress)
        resp.hash = contractTransaction.hash
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-swap')
      return resp
    }
  },
}

const poolDeposit = {
  depositBalancedAmounts: async (activeKey: string, p: Pool, isWrapped: boolean) => {
    log('depositBalancedAmounts', p.name, { isWrapped })
    const resp = { activeKey, amounts: [] as string[], error: '' }
    try {
      resp.amounts = isWrapped ? await p.depositWrappedBalancedAmounts() : await p.depositBalancedAmounts()
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-deposit-balance')
      return resp
    }
  },
  depositBonus: async (activeKey: string, p: Pool, isWrapped: boolean, amounts: string[]) => {
    log('depositBonus', p.name, isWrapped, amounts)
    const resp = { activeKey, bonus: '', error: '' }
    try {
      resp.bonus = isWrapped ? await p.depositWrappedBonus(amounts) : await p.depositBonus(amounts)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-deposit-bonus')
      return resp
    }
  },
  depositExpected: async (activeKey: string, p: Pool, isWrapped: boolean, amounts: string[]) => {
    log('depositExpected', p.name, isWrapped, amounts)
    const resp = { activeKey, expected: '', error: '' }
    try {
      resp.expected = isWrapped ? await p.depositWrappedExpected(amounts) : await p.depositExpected(amounts)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-deposit-withdraw-expected')
      return resp
    }
  },
  depositEstGasApproval: async (
    activeKey: string,
    chainId: ChainId,
    p: Pool,
    isWrapped: boolean,
    amounts: string[],
    maxSlippage: string,
  ) => {
    log('depositEstGasApproval', p.name, isWrapped, amounts, maxSlippage)
    const resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
    try {
      resp.isApproved = isWrapped ? await p.depositWrappedIsApproved(amounts) : await p.depositIsApproved(amounts)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.depositWrapped(amounts, +maxSlippage)
          : await p.estimateGas.deposit(amounts, +maxSlippage)
      } else {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.depositWrappedApprove(amounts)
          : await p.estimateGas.depositApprove(amounts)
      }
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  depositApprove: async (activeKey: string, provider: Provider, p: Pool, isWrapped: boolean, amounts: string[]) => {
    log('depositApprove', p.name, isWrapped, amounts)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = isWrapped ? await p.depositWrappedApprove(amounts) : await p.depositApprove(amounts)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  deposit: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    amounts: string[],
    maxSlippage: string,
  ) => {
    log('deposit', p.name, isWrapped, amounts, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = isWrapped
        ? await p.depositWrapped(amounts, Number(maxSlippage))
        : await p.deposit(amounts, Number(maxSlippage))
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-deposit')
      return resp
    }
  },

  // Deposit and Stake
  depositAndStakeBonus: async (activeKey: string, p: Pool, isWrapped: boolean, amounts: string[]) => {
    log('depositAndStakeBonus', p.name, isWrapped, amounts)
    const resp = { activeKey, bonus: '0', error: '' }
    try {
      resp.bonus = isWrapped ? await p.depositAndStakeWrappedBonus(amounts) : await p.depositAndStakeBonus(amounts)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-deposit-bonus')
      return resp
    }
  },
  depositAndStakeExpected: async (activeKey: string, p: Pool, isWrapped: boolean, amounts: string[]) => {
    log('depositAndStakeExpected', p.name, isWrapped, amounts)
    const resp = { activeKey, expected: '', error: '' }
    try {
      resp.expected = isWrapped
        ? await p.depositAndStakeWrappedExpected(amounts)
        : await p.depositAndStakeExpected(amounts)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-deposit-withdraw-expected')
      return resp
    }
  },
  depositAndStakeEstGasApproval: async (
    activeKey: string,
    chainId: ChainId,
    p: Pool,
    isWrapped: boolean,
    amounts: string[],
    maxSlippage: string,
  ) => {
    log('depositAndStakeEstGasApproval', p.name, isWrapped, amounts, maxSlippage)
    const resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
    try {
      resp.isApproved = isWrapped
        ? await p.depositAndStakeWrappedIsApproved(amounts)
        : await p.depositAndStakeIsApproved(amounts)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.depositAndStakeWrapped(amounts, +maxSlippage)
          : await p.estimateGas.depositAndStake(amounts, +maxSlippage)
      } else {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.depositAndStakeWrappedApprove(amounts)
          : await p.estimateGas.depositAndStakeApprove(amounts)
      }
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  depositAndStakeApprove: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    amounts: string[],
  ) => {
    log('depositAndStakeApprove', p.name, isWrapped, amounts)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = isWrapped ? await p.depositAndStakeWrappedApprove(amounts) : await p.depositAndStakeApprove(amounts)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  depositAndStake: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    amounts: string[],
    maxSlippage: string,
  ) => {
    log('depositAndStake', p.name, isWrapped, amounts, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = isWrapped
        ? await p.depositAndStakeWrapped(amounts, Number(maxSlippage))
        : await p.depositAndStake(amounts, Number(maxSlippage))
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-deposit')
      return resp
    }
  },

  // Staking
  stakeEstGasApproval: async (activeKey: string, chainId: ChainId, p: Pool, lpTokenAmount: string) => {
    log('stakeEstGasApproval', p.name, lpTokenAmount)
    const resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
    try {
      resp.isApproved = await p.stakeIsApproved(lpTokenAmount)
      resp.estimatedGas = resp.isApproved
        ? await p.estimateGas.stake(lpTokenAmount)
        : await p.estimateGas.stakeApprove(lpTokenAmount)
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  stakeApprove: async (activeKey: string, provider: Provider, p: Pool, lpTokenAmount: string) => {
    log('stakeApprove', p.name, lpTokenAmount)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await p.stakeApprove(lpTokenAmount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  stake: async (activeKey: string, provider: Provider, p: Pool, lpTokenAmount: string) => {
    log('stake', p.name, lpTokenAmount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await p.stake(lpTokenAmount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-stake')
      return resp
    }
  },
}

const poolSwap = {
  exchangeOutput: async (
    activeKey: string,
    p: Pool,
    formValues: PoolSwapFormValues,
    maxSlippage: string,
    ignoreExchangeRateCheck: boolean,
  ) => {
    log('exchangeOutput', activeKey, p.name, formValues, maxSlippage)
    const resp = {
      activeKey,
      exchangeRates: [] as ExchangeRate[],
      isExchangeRateLow: false,
      priceImpact: 0,
      fromAmount: '',
      toAmount: '',
      error: '',
      fetchedToAmount: '',
    }

    const { isFrom, isWrapped, fromToken, fromAddress, fromAmount, toAddress, toToken, toAmount } = formValues

    try {
      // get swap from/to amount
      const [swapExpectedResult, swapRequiredResult] = await Promise.allSettled([
        isFrom
          ? isWrapped
            ? p.swapWrappedExpected(fromAddress, toAddress, fromAmount)
            : p.swapExpected(fromAddress, toAddress, fromAmount)
          : '',
        isFrom
          ? ''
          : isWrapped
            ? p.swapWrappedRequired(fromAddress, toAddress, toAmount)
            : p.swapRequired(fromAddress, toAddress, toAmount),
      ])
      const swapExpected = fulfilledValue(swapExpectedResult) ?? ''
      const swapRequired = fulfilledValue(swapRequiredResult) ?? ''
      if (swapExpectedResult.status === 'rejected') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        resp.error = swapExpectedResult.reason?.reason || 'error-swap-exchange-and-output'
      }
      if (swapRequiredResult.status === 'rejected') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        resp.error = swapRequiredResult.reason?.reason || 'error-swap-exchange-and-output'
      }

      // update price impact
      const parsedFromAmount = isFrom ? fromAmount : swapRequired
      const [priceImpactResult] = await Promise.allSettled([
        isWrapped
          ? p.swapWrappedPriceImpact(fromAddress, toAddress, parsedFromAmount)
          : p.swapPriceImpact(fromAddress, toAddress, parsedFromAmount),
      ])
      const priceImpact = fulfilledValue(priceImpactResult) ?? 0
      const exchangeRates = isFrom
        ? getExchangeRates(swapExpected, fromAmount)
        : getExchangeRates(toAmount, swapRequired)

      resp.exchangeRates = [
        { from: fromToken, to: toToken, fromAddress, value: exchangeRates[0] || '', label: `${fromToken}/${toToken}` },
        {
          from: toToken,
          to: fromToken,
          fromAddress: toAddress,
          value: exchangeRates[1] || '',
          label: `${toToken}/${fromToken}`,
        },
      ]
      resp.isExchangeRateLow =
        ignoreExchangeRateCheck || excludeLowExchangeRateCheck(fromAddress, toAddress, [])
          ? false
          : getSwapIsLowExchangeRate(p.isCrypto, exchangeRates[0])
      resp.priceImpact = priceImpact || 0
      resp.fromAmount = isFrom ? fromAmount : swapRequired
      resp.toAmount = isFrom ? swapExpected : toAmount
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-swap-exchange-and-output')
      return resp
    }
  },
  estGasApproval: async (
    activeKey: string,
    chainId: ChainId,
    p: Pool,
    isWrapped: boolean,
    fromAddress: string,
    toAddress: string,
    fromAmount: string,
    maxSlippage: string,
  ) => {
    log('poolSwapEstGasApproval', p.name, isWrapped, fromAddress, toAddress, fromAmount, maxSlippage)
    const resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
    try {
      resp.isApproved = isWrapped
        ? await p.swapWrappedIsApproved(fromAddress, fromAmount)
        : await p.swapIsApproved(fromAddress, fromAmount)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.swapWrapped(fromAddress, toAddress, fromAmount, +maxSlippage)
          : await p.estimateGas.swap(fromAddress, toAddress, fromAmount, +maxSlippage)
      } else {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.swapWrappedApprove(fromAddress, fromAmount)
          : await p.estimateGas.swapApprove(fromAddress, fromAmount)
      }
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  swapApprove: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    fromAddress: string,
    fromAmount: string,
  ) => {
    log('swapApprove', p.name, isWrapped, fromAddress, fromAmount)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = isWrapped
        ? await p.swapWrappedApprove(fromAddress, fromAmount)
        : await p.swapApprove(fromAddress, fromAmount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  swap: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    fromAddress: string,
    toAddress: string,
    fromAmount: string,
    maxSlippage: string,
  ) => {
    log('swap', p.name, isWrapped, fromAddress, toAddress, fromAmount, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = isWrapped
        ? await p.swapWrapped(fromAddress, toAddress, fromAmount, +maxSlippage)
        : await p.swap(fromAddress, toAddress, fromAmount, +maxSlippage)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-swap')
      return resp
    }
  },
}

const poolWithdraw = {
  // withdraw (UI: Balanced amounts)
  withdrawExpected: async (activeKey: string, p: Pool, isWrapped: boolean, lpTokenAmount: string) => {
    log('withdrawExpected', p.name, isWrapped, lpTokenAmount)
    const resp = { activeKey, expected: [] as string[], error: '' }
    try {
      resp.expected = isWrapped
        ? await p.withdrawWrappedExpected(lpTokenAmount)
        : await p.withdrawExpected(lpTokenAmount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-expected')
      return resp
    }
  },
  withdrawEstGasApproval: async (
    activeKey: string,
    chainId: ChainId,
    p: Pool,
    isWrapped: boolean,
    lpTokenAmount: string,
    maxSlippage: string,
  ) => {
    log('withdrawEstGasApproval', p.name, lpTokenAmount, maxSlippage)
    const resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
    try {
      resp.isApproved = await p.withdrawIsApproved(lpTokenAmount)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.withdrawWrapped(lpTokenAmount, +maxSlippage)
          : await p.estimateGas.withdraw(lpTokenAmount, +maxSlippage)
      } else {
        resp.estimatedGas = await p.estimateGas.withdrawApprove(lpTokenAmount)
      }
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  withdrawApprove: async (activeKey: string, provider: Provider, p: Pool, lpTokenAmount: string) => {
    log('withdrawApprove', p.name, lpTokenAmount)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await p.withdrawApprove(lpTokenAmount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  withdraw: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    lpTokenAmount: string,
    maxSlippage: string,
  ) => {
    log('withdraw', p.name, isWrapped, lpTokenAmount, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = isWrapped
        ? await p.withdrawWrapped(lpTokenAmount, Number(maxSlippage))
        : await p.withdraw(lpTokenAmount, Number(maxSlippage))
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-withdraw')
      return resp
    }
  },

  // withdraw imbalance (UI: Custom)
  withdrawImbalanceBonusAndExpected: async (activeKey: string, p: Pool, isWrapped: boolean, amounts: string[]) => {
    log('withdrawImbalanceBonusAndExpected', p.name, isWrapped, amounts)
    const resp = { activeKey, expected: '', bonus: '', error: '' }
    try {
      const [expectedResult, bonusResult] = await Promise.allSettled([
        isWrapped ? p.withdrawImbalanceWrappedExpected(amounts) : p.withdrawImbalanceExpected(amounts),
        isWrapped ? p.withdrawImbalanceWrappedBonus(amounts) : p.withdrawImbalanceBonus(amounts),
      ])
      resp.expected = fulfilledValue(expectedResult) ?? ''
      resp.bonus = fulfilledValue(bonusResult) ?? ''
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-deposit-withdraw-expected-bonus')
      return resp
    }
  },
  withdrawImbalanceEstGasApproval: async (
    activeKey: string,
    chainId: ChainId,
    p: Pool,
    isWrapped: boolean,
    amounts: string[],
    maxSlippage: string,
  ) => {
    log('withdrawImbalanceEstGasApproval', p.name, isWrapped, amounts, maxSlippage)
    const resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
    try {
      resp.isApproved = await p.withdrawImbalanceIsApproved(amounts)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.withdrawImbalanceWrapped(amounts, +maxSlippage)
          : await p.estimateGas.withdrawImbalance(amounts, +maxSlippage)
      } else {
        resp.estimatedGas = await p.estimateGas.withdrawImbalanceApprove(amounts)
      }
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  withdrawImbalanceApprove: async (activeKey: string, provider: Provider, p: Pool, amounts: string[]) => {
    log('withdrawImbalanceApprove', p.name, amounts)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await p.withdrawImbalanceApprove(amounts)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  withdrawImbalance: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    amounts: string[],
    maxSlippage: string,
  ) => {
    log('withdrawImbalance', p.name, isWrapped, amounts, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = isWrapped
        ? await p.withdrawImbalanceWrapped(amounts, +maxSlippage)
        : await p.withdrawImbalance(amounts, +maxSlippage)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-withdraw')
      return resp
    }
  },

  // withdraw one coin (UI: One coin)
  withdrawOneCoinBonusAndExpected: async (
    activeKey: string,
    p: Pool,
    isWrapped: boolean,
    lpTokenAmount: string,
    tokenAddress: string,
  ) => {
    log('withdrawOneCoinBonusAndExpected', p.name, isWrapped, lpTokenAmount, tokenAddress)
    const resp = { activeKey, expected: '', bonus: '', error: '' }
    try {
      const [expectedResult, bonusResult] = await Promise.allSettled([
        isWrapped
          ? p.withdrawOneCoinWrappedExpected(lpTokenAmount, tokenAddress)
          : p.withdrawOneCoinExpected(lpTokenAmount, tokenAddress),
        isWrapped
          ? p.withdrawOneCoinWrappedBonus(lpTokenAmount, tokenAddress)
          : p.withdrawOneCoinBonus(lpTokenAmount, tokenAddress),
      ])
      resp.expected = fulfilledValue(expectedResult) ?? ''
      resp.bonus = fulfilledValue(bonusResult) ?? ''
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-deposit-withdraw-expected-bonus')
      return resp
    }
  },
  withdrawOneCoinEstGasApproval: async (
    activeKey: string,
    chainId: ChainId,
    p: Pool,
    isWrapped: boolean,
    lpTokenAmount: string,
    tokenAddress: string,
    maxSlippage: string,
  ) => {
    log('withdrawOneCoinEstGasApproval', p.name, isWrapped, lpTokenAmount, tokenAddress, maxSlippage)
    const resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
    try {
      resp.isApproved = await p.withdrawOneCoinIsApproved(lpTokenAmount)
      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.withdrawOneCoinWrapped(lpTokenAmount, tokenAddress, +maxSlippage)
          : await p.estimateGas.withdrawOneCoin(lpTokenAmount, tokenAddress, +maxSlippage)
      } else {
        resp.estimatedGas = await p.estimateGas.withdrawOneCoinApprove(lpTokenAmount)
      }
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  withdrawOneCoinApprove: async (activeKey: string, provider: Provider, p: Pool, lpTokenAmount: string) => {
    log('withdrawOneCoinApprove', p.name, lpTokenAmount)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await p.withdrawOneCoinApprove(lpTokenAmount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  withdrawOneCoin: async (
    activeKey: string,
    provider: Provider,
    p: Pool,
    isWrapped: boolean,
    lpTokenAmount: string,
    tokenAddress: string,
    maxSlippage: string,
  ) => {
    log('withdrawOneCoin', p.name, isWrapped, lpTokenAmount, tokenAddress, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = isWrapped
        ? await p.withdrawOneCoinWrapped(lpTokenAmount, tokenAddress, +maxSlippage)
        : await p.withdrawOneCoin(lpTokenAmount, tokenAddress, +maxSlippage)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-withdraw')
      return resp
    }
  },

  // unstake
  unstakeEstGas: async (activeKey: string, chainId: ChainId, p: Pool, lpTokenAmount: string) => {
    log('unstakeEstGas', p.name, lpTokenAmount)
    const resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: true, error: '' }
    try {
      resp.estimatedGas = await p.estimateGas.unstake(lpTokenAmount)
      warnIncorrectEstGas(chainId, resp.estimatedGas)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  unstake: async (activeKey: string, provider: Provider, p: Pool, lpTokenAmount: string) => {
    log('unstake', p.name, lpTokenAmount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await p.unstake(lpTokenAmount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-unstake')
      return resp
    }
  },

  //   claim
  claimableCrv: async (p: Pool) => {
    log('claimableCrv', p.name)
    const fetchedClaimableCrv = await p.claimableCrv()
    if (fetchedClaimableCrv && Number(fetchedClaimableCrv) > 0) {
      return fetchedClaimableCrv
    }
    return ''
  },
  claimableRewards: async (p: Pool, chainId: ChainId) => {
    log('claimableRewards', p.name)
    const claimableRewards = await p.claimableRewards()

    // ClaimableReward[] = [{token: '0x5a98fcbea516cf06857215779fd812ca3bef1b32', symbol: 'LDO', amount: '15.589367306902830498'}]
    return claimableRewards.filter(r => {
      if (chainId !== 1) {
        return r.symbol !== 'CRV' && +r.amount > 0
      }
      return Number(r.amount) > 0
    }) as ClaimableReward[]
  },
  claimableTokens: async (activeKey: string, p: Pool, chainId: ChainId) => {
    const resp = { activeKey, claimableRewards: [] as ClaimableReward[], claimableCrv: '', error: '' }

    if (!isValidAddress(p.gauge.address)) return resp

    try {
      const isRewardsOnly = p.rewardsOnly()

      if (isRewardsOnly) {
        resp.claimableRewards = await poolWithdraw.claimableRewards(p, chainId)
      } else {
        const [claimableRewards, claimableCRV] = await Promise.all([
          poolWithdraw.claimableRewards(p, chainId),
          poolWithdraw.claimableCrv(p),
        ])
        resp.claimableRewards = claimableRewards
        resp.claimableCrv = claimableCRV
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-claimable')
      return resp
    }
  },
  claimCrv: async (activeKey: string, provider: Provider, p: Pool) => {
    log('claimCrv', p.name)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await p.claimCrv()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-claim')
      return resp
    }
  },
  claimRewards: async (activeKey: string, provider: Provider, p: Pool) => {
    log('claimRewards', p.name)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await p.claimRewards()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-claim')
      return resp
    }
  },
}

function warnIncorrectEstGas(chainId: ChainId, estimatedGas: EstimatedGas) {
  const { gasL2 } = getGasConfig(chainId)
  if (gasL2 && !Array.isArray(estimatedGas) && estimatedGas !== null) {
    console.warn('Incorrect estimated gas returned for L2', estimatedGas)
  }
}

export const curvejsApi = { helpers, network, router, poolDeposit, poolWithdraw, poolSwap }
