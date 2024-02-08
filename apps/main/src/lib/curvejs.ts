import type { DateValue } from '@internationalized/date'
import type { FormType as LockFormType } from '@/components/PageCrvLocker/types'
import type { IProfit } from '@curvefi/api/lib/interfaces'
import type { ExchangeRate, FormValues, Route, SearchedParams } from '@/components/PageRouterSwap/types'
import type { FormValues as PoolSwapFormValues } from '@/components/PagePool/Swap/types'

import countBy from 'lodash/countBy'
import dayjs from '@/lib/dayjs'
import chunk from 'lodash/chunk'
import flatten from 'lodash/flatten'
import isUndefined from 'lodash/isUndefined'
import PromisePool from '@supercharge/promise-pool/dist'

import {
  filterCrvProfit,
  filterRewardsApy,
  hasNoWrapped,
  parseBaseProfit,
  separateCrvProfit,
  separateCrvReward,
} from '@/utils/utilsCurvejs'

import networks from '@/networks'
import { BN, formatNumber } from '@/ui/utils'
import { fulfilledValue, getErrorMessage, isValidAddress, log, shortenTokenAddress, shortenTokenName } from '@/utils'
import { httpFetcher } from '@/lib/utils'
import { parseRouterRoutes } from '@/components/PageRouterSwap/utils'
import {
  excludeLowExchangeRateCheck,
  getExchangeRates,
  getIsLowExchangeRate,
  getSwapIsLowExchangeRate,
} from '@/utils/utilsSwap'

// Due to the event from Mutlichain, the CRV rewards distribution for Fantom, Avalanche and Celo are suspended indefinitely. Remove this once it is resolved.
// https://twitter.com/MultichainOrg
// TODO: REMOVE once resolved
const multichainNetworks: { [chainId: string]: boolean } = {
  43114: true,
  42220: true,
  250: true,
}

const helpers = {
  fetchL2GasPrice: async (curve: CurveApi) => {
    let resp = { l2GasPriceWei: 0, error: '' }
    try {
      resp.l2GasPriceWei = await curve.getGasPriceFromL2()
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-gas')
      return resp
    }
  },
  fetchL1AndL2GasPrice: async (curve: CurveApi) => {
    let resp = { l1GasPriceWei: 0, l2GasPriceWei: 0, error: '' }
    try {
      if (networks[curve.chainId].gasL2) {
        const [l2GasPriceWei, l1GasPriceWei] = await Promise.all([curve.getGasPriceFromL2(), curve.getGasPriceFromL1()])
        resp.l2GasPriceWei = l2GasPriceWei
        resp.l1GasPriceWei = l1GasPriceWei
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-gas')
      return resp
    }
  },
  fetchUsdRates: async (curve: CurveApi, tokenAddresses: string[]) => {
    log('fetchUsdRates', tokenAddresses.length)
    let results: UsdRatesMapper = {}

    await PromisePool.for(tokenAddresses)
      .withConcurrency(5)
      .handleError((error, tokenAddress) => {
        console.error(`Unable to get usd rate for ${tokenAddress}`)
        results[tokenAddress] = NaN
      })
      .process(async (tokenAddress) => {
        results[tokenAddress] = await curve.getUsdRate(tokenAddress)
      })
    return results
  },
  waitForTransaction: async (hash: string, provider: Provider) => {
    return provider.waitForTransaction(hash)
  },
  waitForTransactions: async (hashes: string[], provider: Provider) => {
    const { results, errors } = await PromisePool.for(hashes).process(
      async (hash) => await provider.waitForTransaction(hash)
    )
    if (Array.isArray(errors) && errors.length > 0) {
      throw errors
    } else {
      return results
    }
  },
}

// curve
const network = {
  fetchAllPoolsList: async (curve: CurveApi) => {
    log('fetchAllPoolsList', curve.chainId)
    // must call api in this order, must use api to get non-cached version of gaugeStatus
    await Promise.allSettled([
      curve.factory.fetchPools(true),
      curve.cryptoFactory.fetchPools(true),
      curve.crvUSDFactory.fetchPools(true),
      curve.tricryptoFactory.fetchPools(true),
      curve.stableNgFactory.fetchPools(true),
    ])
    await Promise.allSettled([
      curve.factory.fetchNewPools(),
      curve.cryptoFactory.fetchNewPools(),
      curve.tricryptoFactory.fetchNewPools(),
      curve.stableNgFactory.fetchNewPools(),
    ])
    return curve.getPoolList()
  },
  fetchNetworkConfig: (curve: CurveApi) => {
    return {
      hasDepositAndStake: curve.hasDepositAndStake(),
      hasRouter: curve.hasRouter(),
    }
  },
  getTVL: (curve: CurveApi) => {
    log('getChainTVL', curve.chainId)
    let api = curve as CurveApi
    return api.getTVL()
  },
  getVolume: (curve: CurveApi) => {
    log('getChainVolume', curve.chainId)
    let api = curve as CurveApi
    return api.getVolume()
  },
  getFailedFetching24hOldVprice: async () => {
    // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.fi/api/getFactoryAPYs-kava)
    // If `failedFetching24hOldVprice` is true, it means the base apy couldn't be calculated, display in UI
    // something like a dash with a tooltip "not available currently"
    let failedFetching24hOldVprice: { [poolAddress: string]: boolean } = {}
    try {
      const resp = await httpFetcher('https://api.curve.fi/api/getFactoryAPYs-kava')
      if (resp.success && Object.keys(resp.data.poolDetails).length) {
        for (const poolDetail of resp.data.poolDetails) {
          failedFetching24hOldVprice[poolDetail.poolAddress.toLowerCase()] = poolDetail.failedFetching24hOldVprice
        }
      }
      return failedFetching24hOldVprice
    } catch (error) {
      console.warn('Unable to fetch failedFetching24hOldVprice from https://api.curve.fi/api/getFactoryAPYs-kava')
      return failedFetching24hOldVprice
    }
  },
}

const pool = {
  getPoolData: (p: Pool, chainId: ChainId, storedPoolData: PoolData | undefined) => {
    const isWrappedOnly = networks[chainId].poolIsWrappedOnly[p.id]
    const tokensWrapped = p.wrappedCoins.map((token, idx) => token || shortenTokenAddress(p.wrappedCoinAddresses[idx])!)
    const tokens = isWrappedOnly
      ? tokensWrapped
      : p.underlyingCoins.map((token, idx) => token || shortenTokenAddress(p.underlyingCoinAddresses[idx])!)
    const tokensLowercase = tokens.map((c) => c.toLowerCase())
    const tokensAll = isWrappedOnly ? tokensWrapped : [...tokens, ...tokensWrapped]
    const tokenAddresses = isWrappedOnly ? p.wrappedCoinAddresses : p.underlyingCoinAddresses
    const tokenAddressesAll = isWrappedOnly
      ? p.wrappedCoinAddresses
      : [...p.underlyingCoinAddresses, ...p.wrappedCoinAddresses]
    const tokensCountBy = countBy(tokens)

    const poolData: PoolData = {
      pool: p,
      chainId,
      curvefiUrl: '',

      // stats
      currenciesReserves: null,
      parameters: storedPoolData?.parameters
        ? storedPoolData.parameters
        : {
            A: '',
            adminFee: '',
            fee: '',
            future_A: undefined,
            future_A_time: undefined,
            gamma: undefined,
            initial_A: undefined,
            initial_A_time: undefined,
            lpTokenSupply: '',
            virtualPrice: '',
          },

      hasVyperVulnerability: p.hasVyperVulnerability(),

      // transfer
      hasWrapped: isWrappedOnly ?? !hasNoWrapped(p),
      isWrapped: isWrappedOnly ?? false,
      seedData: [],
      tokenAddressesAll,
      tokenAddresses,
      tokens,
      tokensCountBy,
      tokensAll,
      tokensLowercase,
      failedFetching24hOldVprice: false,
    }

    return poolData
  },
  getTvl: async (p: Pool, chainId: ChainId) => {
    let resp = { poolId: p.id, value: '0', errorMessage: '' }

    try {
      const customTvl = networks[chainId].poolCustomTVL[p.id]
      resp.value = p.inApi && !customTvl ? await p.stats.totalLiquidity() : customTvl ?? '0'
      return resp
    } catch (error) {
      console.error(error)
      resp.errorMessage = 'Unable to get tvl'
      return resp
    }
  },
  getVolume: async (p: Pool) => {
    let resp = { poolId: p.id, value: '0', errorMessage: '' }

    try {
      resp.value = p.inApi ? await p.stats.volume() : '0'
      return resp
    } catch (error) {
      console.error(error)
      resp.errorMessage = 'Unable to get volume'
      return resp
    }
  },
  poolBalances: async (p: Pool, isWrapped: boolean) => {
    let resp = { balances: [] as string[], error: '' }
    try {
      resp.balances = isWrapped ? await p.stats.wrappedBalances() : await p.stats.underlyingBalances()
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-stats-balances')
      return resp
    }
  },
  poolParameters: async (p: Pool) => {
    let resp = { parameters: {} as PoolParameters, error: '' }
    try {
      resp.parameters = await p.stats.parameters()
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-parameters')
      return resp
    }
  },
  poolAllRewardsApy: async (chainId: ChainId, p: Pool) => {
    let resp: RewardsApy = {
      poolId: p.id,
      base: { day: '0', week: '0' },
      other: [],
      crv: [0, 0],
      error: {},
    }

    // do not show pool rewards due to exploit https://hackmd.io/@LlamaRisk/BJzSKHNjn
    if (networks[chainId].hidePoolRewards[p.id]) {
      return resp
    }

    // get base vAPY
    const DEFAULT_BASE = { day: '0', week: '0' }
    const [baseApyResult] = await Promise.allSettled([p.inApi ? p.stats.baseApy() : Promise.resolve(DEFAULT_BASE)])
    resp.base = fulfilledValue(baseApyResult) ?? DEFAULT_BASE
    if (baseApyResult.status === 'rejected') {
      resp.error['base'] = true
    } else {
      resp.base.day = new BN(resp.base.day).toFixed(8)
      resp.base.week = new BN(resp.base.week).toFixed(8)
    }

    if (isValidAddress(p.gauge)) {
      const isRewardsOnly = p.rewardsOnly()

      // both crv and incentives (others) are in one call
      if (isRewardsOnly) {
        const [rewardsResult] = await Promise.allSettled([p.stats.rewardsApy()])
        const rewards = fulfilledValue(rewardsResult)
        if (rewardsResult.status === 'rejected') {
          resp.error['others'] = true
          resp.error['crv'] = true
        } else {
          if (rewards) {
            const [others, crv] = separateCrvReward(filterRewardsApy(rewards)) as [RewardOther[], RewardCrv[]]

            // others rewards
            for (const idx in others) {
              const other = others[idx]
              if (+other.apy > 0) {
                resp.other.push(other)
              }
            }

            // crv rewards
            if (+crv[0] > 0 || (+crv[1] > 0 && !multichainNetworks[chainId])) {
              resp.crv = crv
            }
          }
        }
      } else {
        const [otherResult, crvResult] = await Promise.allSettled([p.stats.rewardsApy(), p.stats.tokenApy()])

        // others rewards
        const others = fulfilledValue(otherResult) ?? []
        if (otherResult.status === 'rejected') {
          resp.error['others'] = true
        } else {
          for (const idx in others) {
            const other = others[idx]
            if (chainId === 8453) {
              if (other.symbol !== 'CRV' && +other.apy > 0) {
                resp.other.push(other)
              }
            } else if (+other.apy > 0) {
              resp.other.push(other)
            }
          }
        }

        // crv rewards
        const crv = fulfilledValue(crvResult)
        if (crvResult.status === 'rejected') {
          resp.error['crv'] = true
        } else {
          const [baseApy] = crv ?? []
          if (crv && baseApy && !Number.isNaN(baseApy) && !multichainNetworks[chainId]) {
            resp.crv = crv
          }
        }
      }
    }

    return resp
  },
  poolTokens: (p: Pool, isWrapped: boolean) => {
    return isWrapped ? p.wrappedCoins : p.underlyingCoins
  },
  poolTokenAddresses: (p: Pool, isWrapped: boolean) => {
    return isWrapped ? p.wrappedCoinAddresses : p.underlyingCoinAddresses
  },
}

const router = {
  routesAndOutput: async (
    activeKey: string,
    curve: CurveApi,
    poolsMapper: { [poolId: string]: PoolData },
    formValues: FormValues,
    searchedParams: SearchedParams,
    maxSlippage: string
  ) => {
    const { isFrom, fromAmount, toAmount } = formValues
    const { fromAddress, toAddress } = searchedParams
    log('routesAndOutput', isFrom, fromAddress, fromAmount, toAddress, toAmount, maxSlippage)
    let resp = {
      activeKey,
      exchangeRates: [] as string[],
      isExchangeRateLow: false,
      isExpectedToAmount: false,
      isHighImpact: false,
      isHighSlippage: false,
      maxSlippage: '',
      priceImpact: 0,
      routes: [] as Route[],
      toAmount: '',
      toAmountOutput: '',
      fromAmount: '',
      error: '',
    }

    try {
      // get routes and to amount
      if (isFrom) {
        const [{ route: routes, output }, fetchedToAmount, priceImpact] = await Promise.all([
          curve.router.getBestRouteAndOutput(fromAddress, toAddress, fromAmount),
          curve.router.expected(fromAddress, toAddress, fromAmount),
          curve.router.priceImpact(fromAddress, toAddress, fromAmount),
        ])

        const parsedRouterRoutes = parseRouterRoutes(routes, poolsMapper, curve.getPool)
        const haveCryptoRoutes = parsedRouterRoutes.haveCryptoRoutes
        const parsedMaxSlippage = maxSlippage ? maxSlippage : haveCryptoRoutes ? '0.1' : '0.03'

        resp.exchangeRates = getExchangeRates(fetchedToAmount, fromAmount)
        resp.isExchangeRateLow = excludeLowExchangeRateCheck(fromAddress, toAddress, parsedRouterRoutes.routes)
          ? false
          : getIsLowExchangeRate(haveCryptoRoutes, fetchedToAmount, fromAmount)
        resp.isHighImpact = priceImpact > +parsedMaxSlippage
        resp.isHighSlippage = haveCryptoRoutes ? false : Number(resp.exchangeRates[0]) > 0.98
        resp.maxSlippage = parsedMaxSlippage
        resp.priceImpact = priceImpact
        resp.routes = parsedRouterRoutes.routes
        resp.toAmount = fetchedToAmount
        resp.toAmountOutput = output
        resp.fromAmount = fromAmount
      } else {
        const fetchedFromAmount = await curve.router.required(fromAddress, toAddress, toAmount)
        const [{ route: routes, output }, fetchedToAmount, priceImpact] = await Promise.all([
          curve.router.getBestRouteAndOutput(fromAddress, toAddress, fetchedFromAmount),
          curve.router.expected(fromAddress, toAddress, fetchedFromAmount),
          curve.router.priceImpact(fromAddress, toAddress, fetchedFromAmount),
        ])

        const parsedRouterRoutes = parseRouterRoutes(routes, poolsMapper, curve.getPool)
        const haveCryptoRoutes = parsedRouterRoutes.haveCryptoRoutes
        const parsedMaxSlippage = maxSlippage ? maxSlippage : haveCryptoRoutes ? '0.1' : '0.03'

        resp.exchangeRates = getExchangeRates(toAmount, fetchedFromAmount)
        resp.isExchangeRateLow = excludeLowExchangeRateCheck(fromAddress, toAddress, parsedRouterRoutes.routes)
          ? false
          : getIsLowExchangeRate(haveCryptoRoutes, toAmount, fromAmount)
        resp.isHighImpact = priceImpact > +parsedMaxSlippage
        resp.isHighSlippage = haveCryptoRoutes ? false : Number(resp.exchangeRates[0]) > 0.98
        resp.maxSlippage = parsedMaxSlippage
        resp.priceImpact = priceImpact
        resp.routes = parsedRouterRoutes.routes
        resp.toAmount = toAmount
        resp.toAmountOutput = output
        resp.fromAmount = fetchedFromAmount

        // if input toAmount and fetchedToAmount differ is more than slippage, inform user they will get expected not desired
        resp.isExpectedToAmount = +toAmount - +fetchedToAmount > +parsedMaxSlippage
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
    isApprovalCheckOnly?: boolean
  ) => {
    log('routerEstGasApproval', fromAddress, toAddress, fromAmount)
    const resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
    try {
      resp.isApproved = await curve.router.isApproved(fromAddress, fromAmount)
      if (!isApprovalCheckOnly) {
        resp.estimatedGas = resp.isApproved
          ? await curve.router.estimateGas.swap(fromAddress, toAddress, fromAmount)
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
    fromAmount: string
  ) => {
    log('swapApprove', fromAddress, fromAmount)
    const api = curve as CurveApi
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    slippageTolerance: string
  ) => {
    log('swap', fromAddress, fromAmount, toAddress, slippageTolerance)
    const api = curve as CurveApi
    const resp = { activeKey, hash: '', swappedAmount: '', error: '' }
    try {
      // @ts-ignore
      const contractTransaction = await api.router.swap(fromAddress, toAddress, fromAmount, +slippageTolerance)
      if (contractTransaction) {
        await helpers.waitForTransaction(contractTransaction.hash, provider)
        resp.swappedAmount = await api.router.getSwappedAmount(contractTransaction, toAddress)
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
  // seed info
  cryptoSeedAmounts: (p: Pool, amount: string) => {
    log('cryptoSeedAmounts', p.name)
    return p.cryptoSeedAmounts(amount)
  },
  cryptoSeedInitialRate: async (p: Pool, tokens: string[]) => {
    log('cryptoSeedInitialRate', p.name, tokens)
    const seedAmounts = await poolDeposit.cryptoSeedAmounts(p, '1')
    if (seedAmounts[0] && seedAmounts[1]) {
      const initialRate = Number(seedAmounts[0]) / Number(seedAmounts[1])
      const formattedInitialRate = formatNumber(initialRate, { showAllFractionDigits: true })
      return `${formattedInitialRate} ${shortenTokenName(tokens[0])} = ${formatNumber(1)} ${shortenTokenName(
        tokens[1]
      )}`
    }
    return ''
  },
  metaUnderlyingSeedAmounts: (p: Pool, amount1: string) => {
    log('metaUnderlyingSeedAmounts', p.name, amount1)
    return p.metaUnderlyingSeedAmounts(amount1)
  },

  depositBalancedAmounts: async (activeKey: string, p: Pool, isWrapped: boolean) => {
    log('depositBalancedAmounts', p.name, isWrapped)
    let resp = { activeKey, amounts: [] as string[], error: '' }
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
    let resp = { activeKey, bonus: '', error: '' }
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
    let resp = { activeKey, expected: '', error: '' }
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
    amounts: string[]
  ) => {
    log('depositEstGasApproval', p.name, isWrapped, amounts)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
    try {
      resp.isApproved = isWrapped ? await p.depositWrappedIsApproved(amounts) : await p.depositIsApproved(amounts)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.depositWrapped(amounts)
          : await p.estimateGas.deposit(amounts)
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
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    maxSlippage: string
  ) => {
    log('deposit', p.name, isWrapped, amounts, maxSlippage)
    let resp = { activeKey, hash: '', error: '' }
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
    let resp = { activeKey, bonus: '0', error: '' }
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
    let resp = { activeKey, expected: '', error: '' }
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
    amounts: string[]
  ) => {
    log('depositAndStakeEstGasApproval', p.name, isWrapped, amounts)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
    try {
      resp.isApproved = isWrapped
        ? await p.depositAndStakeWrappedIsApproved(amounts)
        : await p.depositAndStakeIsApproved(amounts)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.depositAndStakeWrapped(amounts)
          : await p.estimateGas.depositAndStake(amounts)
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
    amounts: string[]
  ) => {
    log('depositAndStakeApprove', p.name, isWrapped, amounts)
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    maxSlippage: string
  ) => {
    log('depositAndStake', p.name, isWrapped, amounts, maxSlippage)
    let resp = { activeKey, hash: '', error: '' }
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
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }
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
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    let resp = { activeKey, hash: '', error: '' }
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
  exchangeOutput: async (activeKey: string, p: Pool, formValues: PoolSwapFormValues, maxSlippage: string) => {
    log('exchangeOutput', activeKey, p.name, formValues, maxSlippage)
    let resp = {
      activeKey,
      exchangeRates: [] as ExchangeRate[],
      isExchangeRateLow: false,
      isHighImpact: false,
      priceImpact: 0,
      fromAmount: '',
      toAmount: '',
      error: '',
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
        !isFrom
          ? isWrapped
            ? p.swapWrappedRequired(fromAddress, toAddress, toAmount)
            : p.swapRequired(fromAddress, toAddress, toAmount)
          : '',
      ])
      const swapExpected = fulfilledValue(swapExpectedResult) ?? ''
      const swapRequired = fulfilledValue(swapRequiredResult) ?? ''
      if (swapExpectedResult.status === 'rejected') {
        resp.error = swapExpectedResult.reason?.reason || 'error-swap-exchange-and-output'
      }
      if (swapRequiredResult.status === 'rejected') {
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
        {
          from: fromToken,
          to: toToken,
          fromAddress,
          value: exchangeRates[0] || '',
          label: `${fromToken}/${toToken}`,
        },
        {
          from: toToken,
          to: fromToken,
          fromAddress: toAddress,
          value: exchangeRates[1] || '',
          label: `${toToken}/${fromToken}`,
        },
      ]
      resp.isExchangeRateLow = excludeLowExchangeRateCheck(fromAddress, toAddress, [])
        ? false
        : getSwapIsLowExchangeRate(p.isCrypto, exchangeRates[0])
      resp.isHighImpact = priceImpact > +maxSlippage
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
    maxSlippage: string
  ) => {
    log('poolSwapEstGasApproval', p.name, isWrapped, fromAddress, toAddress, fromAmount, maxSlippage)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
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
    fromAmount: string
  ) => {
    log('swapApprove', p.name, isWrapped, fromAddress, fromAmount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    maxSlippage: string
  ) => {
    log('swap', p.name, isWrapped, fromAddress, toAddress, fromAmount, maxSlippage)
    let resp = { activeKey, hash: '', error: '' }
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
    let resp = { activeKey, expected: [] as string[], error: '' }
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
    lpTokenAmount: string
  ) => {
    log('withdrawEstGasApproval', p.name, lpTokenAmount)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
    try {
      resp.isApproved = await p.withdrawIsApproved(lpTokenAmount)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.withdrawWrapped(lpTokenAmount)
          : await p.estimateGas.withdraw(lpTokenAmount)
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
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    maxSlippage: string
  ) => {
    log('withdraw', p.name, isWrapped, lpTokenAmount, maxSlippage)
    let resp = { activeKey, hash: '', error: '' }
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
    let resp = { activeKey, expected: '', bonus: '', error: '' }
    try {
      const [expectedResult, bonusResult] = await Promise.allSettled([
        isWrapped ? await p.withdrawImbalanceWrappedExpected(amounts) : await p.withdrawImbalanceExpected(amounts),
        isWrapped ? await p.withdrawImbalanceWrappedBonus(amounts) : await p.withdrawImbalanceBonus(amounts),
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
    amounts: string[]
  ) => {
    log('withdrawImbalanceEstGasApproval', p.name, isWrapped, amounts)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
    try {
      resp.isApproved = await p.withdrawImbalanceIsApproved(amounts)

      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.withdrawImbalanceWrapped(amounts)
          : await p.estimateGas.withdrawImbalance(amounts)
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
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    maxSlippage: string
  ) => {
    log('withdrawImbalance', p.name, isWrapped, amounts, maxSlippage)
    let resp = { activeKey, hash: '', error: '' }
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
    tokenAddress: string
  ) => {
    log('withdrawOneCoinBonusAndExpected', p.name, isWrapped, lpTokenAmount, tokenAddress)
    let resp = { activeKey, expected: '', bonus: '', error: '' }
    try {
      const [expectedResult, bonusResult] = await Promise.allSettled([
        isWrapped
          ? await p.withdrawOneCoinWrappedExpected(lpTokenAmount, tokenAddress)
          : await p.withdrawOneCoinExpected(lpTokenAmount, tokenAddress),
        isWrapped
          ? await p.withdrawOneCoinWrappedBonus(lpTokenAmount, tokenAddress)
          : await p.withdrawOneCoinBonus(lpTokenAmount, tokenAddress),
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
    tokenAddress: string
  ) => {
    log('withdrawOneCoinEstGasApproval', p.name, isWrapped, lpTokenAmount, tokenAddress)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: false, error: '' }
    try {
      resp.isApproved = await p.withdrawOneCoinIsApproved(lpTokenAmount)
      if (resp.isApproved) {
        resp.estimatedGas = isWrapped
          ? await p.estimateGas.withdrawOneCoinWrapped(lpTokenAmount, tokenAddress)
          : await p.estimateGas.withdrawOneCoin(lpTokenAmount, tokenAddress)
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
    let resp = { activeKey, hashes: [] as string[], error: '' }
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
    maxSlippage: string
  ) => {
    log('withdrawOneCoin', p.name, isWrapped, lpTokenAmount, tokenAddress, maxSlippage)
    let resp = { activeKey, hash: '', error: '' }
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
    let resp = { activeKey, estimatedGas: null as EstimatedGas, isApproved: true, error: '' }
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
    let resp = { activeKey, hash: '', error: '' }
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
    return claimableRewards.filter((r) => {
      if (chainId !== 1) {
        return r.symbol !== 'CRV' && +r.amount > 0
      }
      return Number(r.amount) > 0
    }) as ClaimableReward[]
  },
  claimableTokens: async (activeKey: string, p: Pool, chainId: ChainId) => {
    let resp = { activeKey, claimableRewards: [] as ClaimableReward[], claimableCrv: '', error: '' }

    if (!isValidAddress(p.gauge)) return resp

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
    let resp = { activeKey, hash: '', error: '' }
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
    let resp = { activeKey, hash: '', error: '' }
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

const wallet = {
  getUserPoolList: async (curve: CurveApi, walletAddress: string) => {
    log('getUserPoolList', curve.chainId, walletAddress)
    let resp = { poolList: [] as string[], error: '' }
    try {
      resp.poolList = await curve.getUserPoolList(walletAddress)
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-pool-list')
      return resp
    }
  },
  getUserLiquidityUSD: async (curve: CurveApi, poolIds: string[], walletAddress: string) => {
    log('getUserLiquidityUSD', poolIds, walletAddress)
    return await curve.getUserLiquidityUSD(poolIds, walletAddress)
  },
  getUserClaimable: async (curve: CurveApi, poolIds: string[], walletAddress: string) => {
    log('getUserClaimable', poolIds, walletAddress)
    const fetchedUserClaimable = await curve.getUserClaimable(poolIds, walletAddress)
    if (curve.chainId === 8453) {
      return fetchedUserClaimable.map((poolClaimables) => {
        if (Array.isArray(poolClaimables)) {
          const crvClaimables = poolClaimables.filter((c) => c.symbol === 'CRV')
          // Base chain show too many CRV
          if (crvClaimables.length === 2) {
            return [crvClaimables[0]]
          }
        }
        return poolClaimables
      })
    }
    return fetchedUserClaimable
  },
  poolWalletBalances: async (curve: CurveApi, poolId: string) => {
    log('poolUserPoolBalances', curve?.signerAddress, poolId)
    const p = curve.getPool(poolId)
    const [wrappedCoinBalances, underlyingBalances, lpTokenBalances] = await Promise.all([
      p.wallet.wrappedCoinBalances(),
      p.wallet.underlyingCoinBalances(),
      p.wallet.lpTokenBalances(),
    ])
    const balances: { [tokenAddress: string]: string } = {}

    Object.entries({
      ...wrappedCoinBalances,
      ...underlyingBalances,
      ...lpTokenBalances,
    }).forEach(([address, balance]) => {
      balances[address] = new BN(balance as string).toString()
    })

    return balances
  },
  userClaimableFees: async (curve: CurveApi, activeKey: string, walletAddress: string) => {
    log('userClaimableFees', activeKey, walletAddress)
    let resp = { activeKey, amount: '', error: '' }
    try {
      resp.amount = await curve.boosting.claimableFees(walletAddress)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-claimable')
      return resp
    }
  },
  userPoolLpTokenBalances: async (p: Pool, signerAddress: string) => {
    const resp = { lpToken: '0', gauge: '0' }
    try {
      const fetchedLpTokenBalances = await p.wallet.lpTokenBalances(signerAddress)
      if (!isUndefined(fetchedLpTokenBalances.lpToken)) {
        resp.lpToken = fetchedLpTokenBalances.lpToken as string
      }
      if (!isUndefined(fetchedLpTokenBalances.gauge)) {
        resp.gauge = fetchedLpTokenBalances.gauge as string
      }
      return resp
    } catch (error) {
      console.error(error)
      return resp
    }
  },
  userPoolBoost: async (p: Pool, walletAddress: string) => {
    const boost = await p.userBoost(walletAddress)
    if (boost && boost === 'NaN') {
      return '0'
    }
    return boost
  },
  userPoolBalances: async (p: Pool) => {
    log('userPoolBalances', p.name)
    return p.userBalances()
  },
  userPoolLiquidityUsd: async (p: Pool, signerAddress: string) => {
    let liquidityUsd = ''

    try {
      log('userPoolLiquidityUsd', p.name, signerAddress)
      const fetchedLiquidityUsd = await p.userLiquidityUSD(signerAddress)

      if (fetchedLiquidityUsd !== 'NaN') {
        liquidityUsd = fetchedLiquidityUsd
      }

      return liquidityUsd
    } catch (error) {
      log('userPoolLiquidityUsd', error, p.name)
    }
  },
  userPoolRewardCrvApy: async (p: Pool, walletAddress: string) => {
    let userCrvApy = 0

    if (isValidAddress(p.gauge) && !p.rewardsOnly()) {
      const fetchedCurrentCrvApy = await p.userCrvApy(walletAddress)
      // @ts-ignore
      if (fetchedCurrentCrvApy !== 'NaN') {
        userCrvApy = fetchedCurrentCrvApy
      }
    }
    return userCrvApy
  },
  userPoolRewardProfit: async (p: Pool, signerAddress: string, chainId: ChainId) => {
    let profit = {
      baseProfit: {
        day: '0',
        week: '0',
        month: '0',
        year: '0',
      },
      crvProfit: {
        day: '0',
        price: 0,
        token: '',
        symbol: '',
        week: '0',
        month: '0',
        year: '0',
      },
      tokensProfit: [] as IProfit[],
    }

    profit.baseProfit = parseBaseProfit(await p.baseProfit(signerAddress))

    if (isValidAddress(p.gauge)) {
      const isRewardsOnly = p.rewardsOnly()
      if (isRewardsOnly) {
        const rewards = await p.rewardsProfit(signerAddress)
        const { crvProfit, tokensProfit } = separateCrvProfit(rewards)
        if (crvProfit) {
          profit.crvProfit = crvProfit
        }
        profit.tokensProfit = tokensProfit
      } else {
        const rewards = await Promise.all([p.crvProfit(signerAddress), p.rewardsProfit(signerAddress)])
        const filteredCrvProfiles = filterCrvProfit(rewards[0])
        if (filteredCrvProfiles) {
          profit.crvProfit = filteredCrvProfiles
        }
        if (chainId === 8453) {
          const foundCRVRewards = rewards[1].find((r) => r.symbol === 'CRV')
          if (!foundCRVRewards) {
            profit.tokensProfit = rewards[1]
          }
        } else {
          profit.tokensProfit = rewards[1]
        }
      }
    }

    return profit
  },
  userPoolShare: async (p: Pool) => {
    log('userPoolShare', p.name)
    return p.userShare()
  },
  fetchUserBalances: async (curve: CurveApi, tokenAddresses: string[]) => {
    const { chainId } = curve
    log('fetchWalletTokensBalances', chainId, tokenAddresses.length)

    const results: UserBalancesMapper = {}
    const errors: string[][] = []
    const chunks = chunk(tokenAddresses, 20)
    await PromisePool.for(chunks)
      .withConcurrency(10)
      .handleError((error, chunk) => {
        errors.push(chunk)
      })
      .process(async (addresses) => {
        const balances = (await curve.getBalances(addresses)) as string[]
        for (const idx in balances) {
          const balance = balances[idx]
          const tokenAddress = addresses[idx]
          results[tokenAddress] = balance
        }
      })

    const fattenErrors = flatten(errors)

    if (fattenErrors.length) {
      await PromisePool.for(fattenErrors)
        .handleError((error, tokenAddress) => {
          console.error(`Unable to get user balance for ${tokenAddress}`, error)
          results[tokenAddress] = 'NaN'
        })
        .process(async (tokenAddress) => {
          const [balance] = (await curve.getBalances([tokenAddress])) as string[]
          results[tokenAddress] = balance
        })
    }
    return results
  },
}

const lockCrv = {
  vecrvInfo: async (activeKey: string, curve: CurveApi, walletAddress: string) => {
    log('vecrvInfo', curve.chainId, walletAddress)
    let resp = {
      activeKey,
      resp: {
        crv: '',
        lockedAmountAndUnlockTime: { lockedAmount: '', unlockTime: 0 },
        veCrv: '',
        veCrvPct: '',
      },
      error: '',
    }

    try {
      const [crv, lockedAmountAndUnlockTime, veCrv, veCrvPct] = await Promise.all([
        curve.boosting.getCrv([walletAddress]),
        curve.boosting.getLockedAmountAndUnlockTime([walletAddress]),
        curve.boosting.getVeCrv([walletAddress]),
        curve.boosting.getVeCrvPct([walletAddress]),
      ])
      resp.resp.crv = crv as string
      resp.resp.lockedAmountAndUnlockTime = lockedAmountAndUnlockTime as { lockedAmount: string; unlockTime: number }
      resp.resp.veCrv = veCrv as string
      resp.resp.veCrvPct = veCrvPct as string

      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-locked-crv-info')
      return resp
    }
  },
  calcUnlockTime: (curve: CurveApi, formType: LockFormType, currTime: number | null, days: number | null) => {
    log('calcUnlockTime', formType, currTime, days)
    let unlockTime = 0
    if (formType === 'adjust_date' && currTime && days) {
      unlockTime = curve.boosting.calcUnlockTime(days, currTime)
    } else if (formType === 'create' && days) {
      unlockTime = curve.boosting.calcUnlockTime(days)
    }
    return dayjs.utc(unlockTime)
  },
  createLock: async (
    activeKey: string,
    curve: CurveApi,
    provider: Provider,
    lockedAmount: string,
    utcDate: DateValue,
    days: number
  ) => {
    log('createLock', lockedAmount, utcDate.toString(), days)
    let resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.createLock(lockedAmount, days)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-create-locked-crv')
      return resp
    }
  },
  estGasApproval: async (
    activeKey: string,
    curve: CurveApi,
    formType: LockFormType,
    lockedAmount: string,
    days: number | null
  ) => {
    log('lockCrvEstGasApproval', formType, lockedAmount, days)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved =
        formType === 'adjust_crv' || formType === 'create' ? await curve.boosting.isApproved(lockedAmount) : true

      if (resp.isApproved) {
        if (formType === 'create' && days) {
          resp.estimatedGas = await curve.boosting.estimateGas.createLock(lockedAmount, days)
        } else if (formType === 'adjust_crv') {
          resp.estimatedGas = await curve.boosting.estimateGas.increaseAmount(lockedAmount)
        } else if (formType === 'adjust_date' && days) {
          resp.estimatedGas = await curve.boosting.estimateGas.increaseUnlockTime(days)
        }
      } else {
        resp.estimatedGas =
          formType === 'create' || formType === 'adjust_crv'
            ? await curve.boosting.estimateGas.approve(lockedAmount)
            : 0
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  lockCrvApprove: async (activeKey: string, provider: Provider, curve: CurveApi, lockedAmount: string) => {
    log('userLockCrvApprove', lockedAmount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await curve.boosting.approve(lockedAmount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  increaseAmount: async (activeKey: string, curve: CurveApi, provider: Provider, lockedAmount: string) => {
    log('increaseAmount', lockedAmount)
    let resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.increaseAmount(lockedAmount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-locked-crv')
      return resp
    }
  },
  increaseUnlockTime: async (activeKey: string, provider: Provider, curve: CurveApi, days: number) => {
    log('increaseUnlockTime', days)
    let resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.increaseUnlockTime(days)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-locked-time')
      return resp
    }
  },
  withdrawLockedCrv: async (curve: CurveApi, provider: Provider, walletAddress: string) => {
    log('withdrawLockedCrv', curve.chainId)
    let resp = { walletAddress, hash: '', error: '' }
    try {
      resp.hash = await curve.boosting.withdrawLockedCrv()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-withdraw-locked-crv')
      return resp
    }
  },
  claimFees: async (activeKey: string, curve: CurveApi, provider: Provider) => {
    log('claimFees', curve.chainId)
    let resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await curve.boosting.claimFees()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-claim-fees')
      return resp
    }
  },
}

function warnIncorrectEstGas(chainId: ChainId, estimatedGas: EstimatedGas) {
  const isGasL2 = networks[chainId]?.gasL2
  if (isGasL2 && !Array.isArray(estimatedGas) && estimatedGas !== null) {
    console.warn('Incorrect estimated gas returned for L2', estimatedGas)
  }
}

const curvejsApi = {
  helpers,
  network,
  router,
  pool,
  poolDeposit,
  poolWithdraw,
  poolSwap,
  wallet,
  lockCrv,
}

export default curvejsApi
