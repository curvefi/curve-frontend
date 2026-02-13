import { cloneDeep } from 'lodash'
import {
  getIsUserCloseToLiquidation,
  getLiquidationStatus,
  hasV2Leverage,
  reverseBands,
  sortBandsMint,
} from '@/llamalend/llama.utils'
import type { FormDetailInfo as FormDetailInfoDeleverage } from '@/loan/components/PageMintMarket/LoanDeleverage/types'
import type { MaxRecvLeverage as MaxRecvLeverageForm } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import type { LiqRange, MaxRecvLeverage, Provider } from '@/loan/store/types'
import { type BandBalance, ChainId, LlamaApi, Llamma, UserLoanDetails } from '@/loan/types/loan.types'
import { fulfilledValue, log } from '@/loan/utils/helpers'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import PromisePool from '@supercharge/promise-pool'
import { BN } from '@ui/utils'
import { waitForTransaction, waitForTransactions } from '@ui-kit/lib/ethers'
import { getErrorMessage } from '@ui-kit/utils'
import { ROUTE_AGGREGATOR_LABELS, RouteAggregator } from '../constants'
import { getLeverageV2RepayArgs, isHigherThanMaxSlippage } from '../utils/utilsLoan'

export const network = {
  1: {
    blockchainId: 'ethereum',
  },
}

const DEFAULT_USER_STATE = {
  collateral: '0',
  stablecoin: '0',
  debt: '0',
}

const DEFAULT_USER_LOSS = {
  deposited_collateral: '0',
  current_collateral_estimation: '0',
  loss: '0',
  loss_pct: '0',
}

const DEFAULT_BAND_BALANCES = {
  '0': { stablecoin: '0', collateral: '0' },
}

const DEFAULT_PARAMETERS = {
  fee: '',
  future_rate: '',
  admin_fee: '',
  rate: '',
  liquidation_discount: '',
  loan_discount: '',
}

function parseUserLoss(userLoss: UserLoanDetails['userLoss']) {
  const smallAmount = 0.00000001
  const resp = cloneDeep(userLoss)
  resp.loss = resp.loss && BN(resp.loss).isLessThan(smallAmount) ? '0' : userLoss.loss
  resp.loss_pct = resp.loss_pct && BN(resp.loss_pct).isLessThan(smallAmount) ? '0' : userLoss.loss_pct

  return resp
}

async function fetchChartBandBalancesData(
  {
    bandBalances,
    bandBalancesArr,
  }: {
    bandBalancesArr: { stablecoin: string; collateral: string; band: string }[]
    bandBalances: BandBalance
  },
  liquidationBand: number | null,
  llamma: Llamma,
) {
  // filter out bands that doesn't have stablecoin and collaterals
  const ns = bandBalancesArr
    .filter((b) => {
      const { stablecoin, collateral } = bandBalances[b.band] ?? {}
      return +stablecoin > 0 || +collateral > 0
    })
    .map((b) => b.band)

  // TODO: handle errors
  const { results } = await PromisePool.for(ns).process(async (n) => {
    const { collateral, stablecoin } = bandBalances[n]
    const [p_up, p_down] = await llamma.calcBandPrices(+n)
    const sqrt = new BN(p_up).multipliedBy(p_down).squareRoot()
    const pUpDownMedian = new BN(p_up).plus(p_down).dividedBy(2).toFixed(5)
    const collateralUsd = new BN(collateral).multipliedBy(sqrt)

    return {
      collateral,
      collateralUsd: collateralUsd.toString(),
      isLiquidationBand: liquidationBand ? (liquidationBand === +n ? 'SL' : '') : '',
      isOraclePriceBand: false, // update this with detail info oracle price
      isNGrouped: false,
      n,
      p_up,
      p_down,
      pUpDownMedian,
      stablecoin,
      collateralStablecoinUsd: collateralUsd.plus(stablecoin).toNumber(),
    }
  })

  const parsedBandBalances = []
  for (const idx in results) {
    const r = results[idx]
    parsedBandBalances.unshift(r)
  }
  return parsedBandBalances
}

// need due to issue with chart label not showing up correctly.
export function loadingLRPrices(prices: string[]) {
  if (!prices) return
  if (prices.length === 0) return []
  let randomNum = Math.floor(Math.random() * 100 + 1)
  randomNum = randomNum * 0.000001
  return [`${+prices[0] + randomNum}`, `${+prices[1] + randomNum}`]
}

const detailInfo = {
  priceInfo: async (llamma: Llamma) => {
    log('priceInfo', llamma.collateralSymbol)
    const resp: { oraclePrice: string; oraclePriceBand: number | null; price: string; error: string } = {
      oraclePrice: '',
      oraclePriceBand: null,
      price: '',
      error: '',
    }

    const [oraclePriceResult, oraclePriceBandResult, priceResult] = await Promise.allSettled([
      llamma.oraclePrice(),
      llamma.oraclePriceBand(),
      llamma.price(),
    ])
    resp.oraclePrice = fulfilledValue(oraclePriceResult) ?? ''
    resp.oraclePriceBand = fulfilledValue(oraclePriceBandResult) ?? null
    resp.price = fulfilledValue(priceResult) ?? ''

    if (oraclePriceResult.status === 'rejected' || priceResult.status === 'rejected') {
      resp.error = 'error-price'
    }

    return resp
  },
  loanPartialInfo: async (llamma: Llamma) => {
    log('loanPartialInfo', llamma.collateralSymbol)
    const [
      oraclePriceBandResult,
      parametersResult,
      totalDebtResult,
      totalCollateralResult,
      totalStablecoinResult,
      capAndAvailableResult,
    ] = await Promise.allSettled([
      llamma.oraclePriceBand(),
      llamma.stats.parameters(),
      llamma.stats.totalDebt(),
      llamma.stats.totalCollateral(),
      llamma.stats.totalStablecoin(),
      llamma.stats.capAndAvailable(),
    ])
    const oraclePriceBand = fulfilledValue(oraclePriceBandResult) ?? null
    const parameters = fulfilledValue(parametersResult) ?? DEFAULT_PARAMETERS
    const totalDebt = fulfilledValue(totalDebtResult) ?? '0'
    const totalCollateral = fulfilledValue(totalCollateralResult) ?? '0'
    const totalStablecoin = fulfilledValue(totalStablecoinResult) ?? '0'
    const capAndAvailable = fulfilledValue(capAndAvailableResult) ?? { cap: '0', available: '0' }

    return {
      oraclePriceBand,
      collateralId: llamma.id,
      parameters,
      totalDebt,
      totalCollateral,
      totalStablecoin,
      capAndAvailable,
    }
  },
  loanInfo: async (llamma: Llamma) => {
    log('loanInfo', llamma.collateralSymbol)
    const fetchedPartialLoanInfo = await detailInfo.loanPartialInfo(llamma)
    const [balancesResult, bandsBalancesResult, liquidationBandResult, basePriceResult] = await Promise.allSettled([
      llamma.stats.balances(),
      llamma.stats.bandsBalances(),
      llamma.stats.liquidatingBand(),
      llamma.basePrice(),
    ])
    const balances = fulfilledValue(balancesResult) ?? ['0', '0']
    const bandsBalances = fulfilledValue(bandsBalancesResult) ?? DEFAULT_BAND_BALANCES
    const liquidationBand = fulfilledValue(liquidationBandResult) ?? null
    const basePrice = fulfilledValue(basePriceResult) ?? undefined

    const parsedBandsBalances = await fetchChartBandBalancesData(sortBandsMint(bandsBalances), liquidationBand, llamma)

    return {
      ...fetchedPartialLoanInfo,
      basePrice,
      balances,
      bandsBalances: parsedBandsBalances,
    }
  },
  userLoanInfo: async (llamma: Llamma, address: string) => {
    log('userLoanInfo', llamma.collateralSymbol, address)
    const loanExists = await llamma.loanExists(address)
    const fetchedPartialUserLoanInfo = await detailInfo.userLoanPartialInfo(llamma, address)

    const [userBandsRangeResult, userPricesResult, userLossResult, userBandsBalancesResult] = await Promise.allSettled([
      loanExists ? llamma.userRange(address) : Promise.resolve(0),
      loanExists ? llamma.userPrices(address) : Promise.resolve([] as string[]),
      loanExists ? llamma.userLoss(address) : Promise.resolve(DEFAULT_USER_LOSS),
      loanExists ? llamma.userBandsBalances(address) : Promise.resolve(DEFAULT_BAND_BALANCES),
    ])

    const userBandsRange = fulfilledValue(userBandsRangeResult) ?? null
    const userPrices = fulfilledValue(userPricesResult) ?? ([] as string[])
    const userLoss = fulfilledValue(userLossResult) ?? DEFAULT_USER_LOSS
    const userBandsBalances = fulfilledValue(userBandsBalancesResult) ?? DEFAULT_BAND_BALANCES

    const { healthNotFull, userState, userIsCloseToLiquidation, userLiquidationBand } = fetchedPartialUserLoanInfo

    const parsedBandsBalances = await fetchChartBandBalancesData(
      sortBandsMint(userBandsBalances),
      userLiquidationBand,
      llamma,
    )

    const fetchedUserDetails: UserLoanDetails = {
      loading: false,
      ...fetchedPartialUserLoanInfo,
      userBandsBalances: parsedBandsBalances,
      userBandsRange,
      userBandsPct: userBandsRange ? llamma.calcRangePct(userBandsRange) : '0',
      userPrices,
      userLoss: parseUserLoss(userLoss),
      userStatus: getLiquidationStatus(healthNotFull, userIsCloseToLiquidation, userState.stablecoin),
    }

    return fetchedUserDetails
  },
  userLoanPartialInfo: async (llamma: Llamma, address: string) => {
    log('userLoanInfo', llamma.collateralSymbol, address)
    const loanExists = await llamma?.loanExists(address)

    const [
      healthFullResult,
      healthNotFullResult,
      userBandsResult,
      userStateResult,
      liquidatingBandResult,
      oraclePriceBandResult,
    ] = await Promise.allSettled([
      loanExists ? llamma.userHealth(true, address) : Promise.resolve(''),
      loanExists ? llamma.userHealth(false, address) : Promise.resolve(''),
      loanExists ? llamma.userBands(address) : Promise.resolve([0, 0]),
      loanExists ? llamma.userState(address) : Promise.resolve(DEFAULT_USER_STATE),
      loanExists ? llamma.stats.liquidatingBand() : Promise.resolve(null),
      loanExists ? llamma.oraclePriceBand() : Promise.resolve(null),
    ])

    const healthFull = fulfilledValue(healthFullResult) ?? ''
    const healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
    const userBands = fulfilledValue(userBandsResult) ?? ([0, 0] as [number, number])
    const userState = fulfilledValue(userStateResult) ?? DEFAULT_USER_STATE
    const userLiquidationBand = fulfilledValue(liquidatingBandResult) ?? null
    const oraclePriceBand = fulfilledValue(oraclePriceBandResult) ?? null

    const reversedUserBands = reverseBands(userBands)
    const userIsCloseToLiquidation = getIsUserCloseToLiquidation(
      reversedUserBands[0],
      userLiquidationBand,
      oraclePriceBand,
    )

    const fetchedUserDetails: {
      healthFull: UserLoanDetails['healthFull']
      healthNotFull: UserLoanDetails['healthNotFull']
      userBands: UserLoanDetails['userBands']
      userHealth: UserLoanDetails['userHealth']
      userIsCloseToLiquidation: UserLoanDetails['userIsCloseToLiquidation']
      userState: UserLoanDetails['userState']
      userLiquidationBand: UserLoanDetails['userLiquidationBand']
    } = {
      healthFull,
      healthNotFull,
      userBands: reversedUserBands,
      userHealth: +healthNotFull < 0 ? healthNotFull : healthFull,
      userIsCloseToLiquidation,
      userState,
      userLiquidationBand,
    }

    return fetchedUserDetails
  },
  userBalances: async (llamma: Llamma) => {
    log('userBalances', llamma.collateralSymbol)
    const resp = { stablecoin: '0', collateral: '0', error: '' }
    try {
      const fetchedBalances = await llamma.wallet.balances()
      resp.stablecoin = fetchedBalances.stablecoin
      resp.collateral = fetchedBalances.collateral
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-user-wallet-balances')
      return resp
    }
  },
  userTokenBalance: async (api: LlamaApi, token: string) => {
    log('userTokenBalance', token)
    const resp = { balance: '', error: '' }

    try {
      const tokenBalances = await api.getBalances([token])
      resp.balance = tokenBalances[0]
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-user-token-balance')
      return resp
    }
  },
}

const initialGas = 0 as TGas

const loanCreate = {
  estGasApproval: async (
    activeKey: string,
    llamma: Llamma,
    isLeverage: boolean,
    collateral: string,
    debt: string,
    n: number,
    maxSlippage: string,
  ) => {
    log('loanEstGas', llamma.collateralSymbol, collateral, debt, n, maxSlippage)
    const resp = { activeKey, isApproved: false, estimatedGas: initialGas, error: '' }
    const userBorrowed = '0' // hardcode to zero as that's not displayed in the form

    try {
      if (isLeverage && hasV2Leverage(llamma)) {
        await llamma.leverageV2.createLoanExpectedCollateral(collateral, userBorrowed, debt, +maxSlippage)
        resp.isApproved = await llamma.leverageV2.createLoanIsApproved(collateral, userBorrowed)
        resp.estimatedGas = resp.isApproved
          ? await llamma.leverageV2.estimateGas.createLoan(collateral, userBorrowed, debt, n, +maxSlippage)
          : await llamma.leverageV2.estimateGas.createLoanApprove(collateral, userBorrowed)
        return resp
      }

      resp.isApproved = isLeverage
        ? await llamma.leverage.createLoanIsApproved(collateral)
        : await llamma.createLoanIsApproved(collateral)
      resp.estimatedGas = resp.isApproved
        ? isLeverage
          ? await llamma.leverage.estimateGas.createLoan(collateral, debt, n, +maxSlippage)
          : await llamma.estimateGas.createLoan(collateral, debt, n)
        : isLeverage
          ? await llamma.leverage.estimateGas.createLoanApprove(collateral)
          : await llamma.estimateGas.createLoanApprove(collateral)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  detailInfo: async (
    activeKey: string,
    llamma: Llamma,
    collateral: string,
    debt: string,
    n: number,
    address: string | undefined,
  ) => {
    log('detailInfo', llamma.collateralSymbol, collateral, debt, n, address)
    const [healthFullResult, healthNotFullResult, bandsResult, pricesResult] = await Promise.allSettled([
      address ? llamma.createLoanHealth(collateral, debt, n, undefined, address) : Promise.resolve(''),
      address ? llamma.createLoanHealth(collateral, debt, n, false, address) : Promise.resolve(''),
      llamma.createLoanBands(collateral, debt, n),
      llamma.createLoanPrices(collateral, debt, n),
    ])

    const healthFull = fulfilledValue(healthFullResult) ?? ''
    const healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
    const prices = fulfilledValue(pricesResult) ?? []
    const bands = fulfilledValue(bandsResult) ?? [0, 0]

    return {
      activeKey,
      resp: {
        healthFull,
        healthNotFull,
        prices,
        bands: reverseBands(bands),
      },
    }
  },
  detailInfoLeverage: async (
    activeKey: string,
    llamma: Llamma,
    userCollateral: string,
    debt: string,
    n: number,
    maxSlippage: string,
  ) => {
    log('detailInfoLeverage', llamma.collateralSymbol, userCollateral, debt, n, maxSlippage)
    const userBorrowed = '0' // hardcode to zero as that's not displayed in the form

    try {
      if (hasV2Leverage(llamma)) {
        // Expected collateral must run first to populate swap data cache used by other calls
        const expectedCollateralResult = await llamma.leverageV2.createLoanExpectedCollateral(
          userCollateral,
          userBorrowed,
          debt,
          +maxSlippage,
        )
        const [
          maxRangeResult,
          loanBandsResult,
          loanPricesResult,
          loanHealthFullResult,
          loanHealthNotFullResult,
          priceImpactResult,
        ] = await Promise.allSettled([
          llamma.leverageV2.createLoanMaxRange(userCollateral, userBorrowed, debt),
          llamma.leverageV2.createLoanBands(userCollateral, userBorrowed, debt, n),
          llamma.leverageV2.createLoanPrices(userCollateral, userBorrowed, debt, n),
          llamma.leverageV2.createLoanHealth(userCollateral, userBorrowed, debt, n, true),
          llamma.leverageV2.createLoanHealth(userCollateral, userBorrowed, debt, n, false),
          llamma.leverageV2.createLoanPriceImpact(userBorrowed, debt),
        ])

        const expectedCollateral = expectedCollateralResult
        const priceImpact = fulfilledValue(priceImpactResult) ?? ''

        return {
          activeKey,
          resp: {
            collateral: expectedCollateral?.totalCollateral ?? '',
            leverage: expectedCollateral?.leverage ?? '',
            routeName: '',
            maxRange: fulfilledValue(maxRangeResult) ?? null,
            bands: reverseBands(fulfilledValue(loanBandsResult) ?? [0, 0]),
            prices: fulfilledValue(loanPricesResult) ?? [],
            healthFull: fulfilledValue(loanHealthFullResult) ?? '',
            healthNotFull: fulfilledValue(loanHealthNotFullResult) ?? '',
            priceImpact,
            isHighImpact: +priceImpact > 0 && +maxSlippage > 0 ? +priceImpact > +maxSlippage : false,
            error: '',
          },
        }
      }

      const { collateral, leverage, routeIdx } = await llamma.leverage.createLoanCollateral(userCollateral, debt)
      const [
        routeNameResult,
        maxRangeResult,
        loanBandsResult,
        loanPricesResult,
        loanHealthFullResult,
        loanHealthNotFullResult,
        priceImpactResult,
      ] = await Promise.allSettled([
        llamma.leverage.getRouteName(routeIdx),
        llamma.leverage.getMaxRange(userCollateral, debt),
        llamma.leverage.createLoanBands(userCollateral, debt, n),
        llamma.leverage.createLoanPrices(userCollateral, debt, n),
        llamma.leverage.createLoanHealth(userCollateral, debt, n),
        llamma.leverage.createLoanHealth(userCollateral, debt, n, false),
        llamma.leverage.priceImpact(userCollateral, debt),
      ])

      const priceImpact = fulfilledValue(priceImpactResult) ?? ''

      return {
        activeKey,
        resp: {
          collateral,
          leverage,
          routeName: fulfilledValue(routeNameResult) ?? '',
          maxRange: fulfilledValue(maxRangeResult) ?? null,
          bands: reverseBands(fulfilledValue(loanBandsResult) ?? [0, 0]),
          prices: fulfilledValue(loanPricesResult) ?? [],
          healthFull: fulfilledValue(loanHealthFullResult) ?? '',
          healthNotFull: fulfilledValue(loanHealthNotFullResult) ?? '',
          priceImpact,
          isHighImpact: +priceImpact > 0 && +maxSlippage > 0 ? +priceImpact > +maxSlippage : false,
          error: '',
        },
      }
    } catch (error) {
      console.error(error)
      return {
        activeKey,
        resp: {
          collateral: '',
          leverage: '',
          routeName: '',
          maxRange: null,
          bands: [0, 0],
          prices: [],
          healthFull: '',
          healthNotFull: '',
          priceImpact: '',
          isHighImpact: false,
          error: getErrorMessage(error, ''),
        },
      }
    }
  },
  liqRanges: async (activeKey: string, llamma: Llamma, isLeverage: boolean, collateral: string, debt: string) => {
    log('liqRanges', llamma.collateralSymbol, collateral, debt)

    const { minBands, maxBands } = llamma
    const bands = Array.from({ length: +maxBands - +minBands + 1 }, (_, i) => i + minBands)
    const haveCollateral = +collateral > 0
    const haveDebt = +debt > 0
    const liqRangesList: LiqRange[] = []
    const liqRangesListMapper: { [n: string]: LiqRange & { sliderIdx: number } } = {}
    let sliderIdx = 0
    const isV2LeverageSupported = hasV2Leverage(llamma)
    const userBorrowed = '0' // hardcode to zero as that's not displayed in the form

    const [maxRecvsResults, loanBandsResults, loanPricesResults] = await Promise.allSettled([
      haveCollateral
        ? isLeverage
          ? isV2LeverageSupported
            ? llamma.leverageV2.createLoanMaxRecvAllRanges(collateral, userBorrowed)
            : llamma.leverage.createLoanMaxRecvAllRanges(collateral)
          : llamma.createLoanMaxRecvAllRanges(collateral)
        : null,
      haveCollateral && haveDebt
        ? isLeverage
          ? isV2LeverageSupported
            ? llamma.leverageV2.createLoanBandsAllRanges(collateral, userBorrowed, debt)
            : llamma.leverage.createLoanBandsAllRanges(collateral, debt)
          : llamma.createLoanBandsAllRanges(collateral, debt)
        : null,
      haveCollateral && haveDebt
        ? isLeverage
          ? isV2LeverageSupported
            ? llamma.leverageV2.createLoanPricesAllRanges(collateral, userBorrowed, debt)
            : llamma.leverage.createLoanPricesAllRanges(collateral, debt)
          : llamma.createLoanPricesAllRanges(collateral, debt)
        : null,
    ])

    const maxRecvs = fulfilledValue(maxRecvsResults) ?? null
    const loanPrices = fulfilledValue(loanPricesResults) ?? null
    const loanBands = fulfilledValue(loanBandsResults) ?? null

    for (const n of bands) {
      const bands = loanBands?.[n]
      const nLoanPrices = loanPrices?.[n]

      const detail: LiqRange = {
        n: Number(n),
        collateral,
        debt,
        maxRecv: (!isLeverage && (maxRecvs as Record<number, string>)?.[n]) || '',
        maxRecvLeverage: (isLeverage && (maxRecvs as Record<number, MaxRecvLeverage>)?.[n]) || null,
        maxRecvError: maxRecvsResults.status === 'rejected' ? maxRecvsResults.reason : '',
        prices: nLoanPrices ? [nLoanPrices[1], nLoanPrices[0]] : [],
        bands: bands ? reverseBands(bands) : [0, 0],
      }
      liqRangesList.push(detail)
      liqRangesListMapper[n] = { ...detail, sliderIdx }
      sliderIdx++
    }

    return {
      activeKey,
      liqRanges: liqRangesList,
      liqRangesMapper: liqRangesListMapper,
    }
  },
  maxRecv: async (activeKey: string, llamma: Llamma, collateral: string, n: number) => {
    log('maxRecv', llamma.collateralSymbol, collateral, n)
    const resp = { activeKey, maxRecv: '', error: '' }

    try {
      resp.maxRecv = await llamma.createLoanMaxRecv(collateral, n)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  maxRecvLeverage: async (activeKey: string, llamma: Llamma, collateral: string, n: number) => {
    log('maxRecvLeverage', llamma.collateralSymbol, collateral, n)
    let resp: MaxRecvLeverageForm = { maxBorrowable: '', maxCollateral: '', leverage: '', routeIdx: null }
    const userBorrowed = '0' // hardcode to zero as that's not displayed in the form
    try {
      if (hasV2Leverage(llamma)) {
        const result = await llamma.leverageV2.createLoanMaxRecv(collateral, userBorrowed, n)
        resp = {
          maxBorrowable: result.maxDebt,
          maxCollateral: result.maxTotalCollateral,
          leverage: result.maxLeverage,
          routeIdx: null,
        }
        return { activeKey, resp, error: '' }
      }

      resp = await llamma.leverage.createLoanMaxRecv(collateral, n)
      return { activeKey, resp, error: '' }
    } catch (error) {
      console.error(error)
      return { activeKey, resp, error: getErrorMessage(error, 'error-max-amount') }
    }
  },
  approve: async (activeKey: string, provider: Provider, llamma: Llamma, isLeverage: boolean, collateral: string) => {
    log('createLoanApprove', llamma.collateralSymbol, isLeverage ? 'leverage' : '', collateral)
    const resp = { activeKey, hashes: [] as string[], error: '' }
    const userBorrowed = '0' // hardcode to zero as that's not displayed in the form
    try {
      resp.hashes = isLeverage
        ? hasV2Leverage(llamma)
          ? await llamma.leverageV2.createLoanApprove(collateral, userBorrowed)
          : await llamma.leverage.createLoanApprove(collateral)
        : await llamma.createLoanApprove(collateral)
      await waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  create: async (
    activeKey: string,
    provider: Provider,
    llamma: Llamma,
    isLeverage: boolean,
    collateral: string,
    debt: string,
    n: number,
    maxSlippage: string,
  ) => {
    log('loanCreate', llamma.collateralSymbol, isLeverage ? 'isLeverage' : '', collateral, debt, n, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    const userBorrowed = '0' // hardcode to zero as that's not displayed in the form
    try {
      resp.hash = isLeverage
        ? hasV2Leverage(llamma)
          ? await llamma.leverageV2.createLoan(collateral, userBorrowed, debt, n, +maxSlippage)
          : await llamma.leverage.createLoan(collateral, debt, n, +maxSlippage)
        : await llamma.createLoan(collateral, debt, n)
      await waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-create')
      return resp
    }
  },
}

const loanIncrease = {
  estGasApproval: async (activeKey: string, llamma: Llamma, collateral: string, debt: string) => {
    const parsedCollateral = collateral || '0'
    const parsedDebt = debt || '0'
    log('estGasApproval', activeKey, llamma.collateralSymbol, parsedCollateral, parsedDebt)
    const resp = { activeKey, isApproved: false, estimatedGas: initialGas, error: '' }

    try {
      resp.isApproved = await llamma.borrowMoreIsApproved(parsedCollateral)
      resp.estimatedGas = resp.isApproved
        ? await llamma.estimateGas.borrowMore(parsedCollateral, parsedDebt)
        : await llamma.estimateGas.borrowMoreApprove(parsedCollateral)
      return resp
    } catch (error) {
      console.error(error)
      if (error?.message && error.message.includes('liquidation mode')) {
        resp.error = 'error-liquidation-mode'
      } else {
        resp.error = getErrorMessage(error, 'error-est-gas-approval')
      }
      return resp
    }
  },
  detailInfo: async (activeKey: string, llamma: Llamma, collateral: string, debt: string, address?: string) => {
    const parsedCollateral = collateral || '0'
    const parsedDebt = debt || '0'
    log('detailInfo', parsedCollateral, parsedDebt, address)
    const [healthFullResult, healthNotFullResult, bandsResult, pricesResult] = await Promise.allSettled([
      llamma.borrowMoreHealth(parsedCollateral, parsedDebt, true, address),
      llamma.borrowMoreHealth(parsedCollateral, parsedDebt, false, address),
      llamma.borrowMoreBands(parsedCollateral, parsedDebt),
      llamma.borrowMorePrices(parsedCollateral, parsedDebt),
    ])

    if (pricesResult.status === 'rejected') {
      return {
        activeKey,
        resp: {
          healthFull: '',
          healthNotFull: '',
          prices: [],
          bands: [],
          error: pricesResult.reason,
        },
      }
    } else {
      const healthFull = fulfilledValue(healthFullResult) ?? ''
      const healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
      const prices = fulfilledValue(pricesResult) ?? []
      const bands = fulfilledValue(bandsResult) ?? [0, 0]

      return {
        activeKey,
        resp: {
          healthFull,
          healthNotFull,
          prices,
          bands: reverseBands(bands),
          error: '',
        },
      }
    }
  },
  maxRecv: async (llamma: Llamma, collateral: string) => {
    const resp = { maxRecv: '', error: '' }

    try {
      const parsedCollateral = collateral || '0'
      log('borrowMoreMaxRecv', llamma.collateralSymbol, parsedCollateral)
      resp.maxRecv = await llamma.borrowMoreMaxRecv(parsedCollateral)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  approve: async (_activeKey: string, provider: Provider, llamma: Llamma, collateral: string) => {
    const parsedCollateral = collateral || '0'
    log('borrowMoreApprove', llamma.collateralSymbol, parsedCollateral)
    const resp = { hashes: [] as string[], error: '' }

    try {
      resp.hashes = await llamma.borrowMoreApprove(parsedCollateral)
      await waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  borrowMore: async (activeKey: string, provider: Provider, llamma: Llamma, collateral: string, debt: string) => {
    const parsedCollateral = collateral || '0'
    const parsedDebt = debt || '0'
    log('borrowMore', llamma.collateralSymbol, parsedCollateral, parsedDebt)
    const resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await llamma.borrowMore(parsedCollateral, parsedDebt)
      await waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-borrow-more')
      return resp
    }
  },
}

const loanDecrease = {
  estGasApproval: async (activeKey: string, llamma: Llamma, debt: string, isFullRepay: boolean) => {
    log('estGasApproval', llamma.collateralSymbol, isFullRepay, debt)
    const resp = { activeKey, isApproved: false, estimatedGas: initialGas, error: '' }

    try {
      resp.isApproved = isFullRepay ? await llamma.fullRepayIsApproved() : await llamma.repayIsApproved(debt)
      resp.estimatedGas = resp.isApproved
        ? isFullRepay
          ? await llamma.estimateGas.fullRepay()
          : await llamma.estimateGas.repay(debt)
        : isFullRepay
          ? await llamma.estimateGas.fullRepayApprove()
          : await llamma.estimateGas.repayApprove(debt)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  detailInfo: async (activeKey: string, llamma: Llamma, debt: string, address?: string) => {
    log('collateralDecreaseHealth', llamma.collateralSymbol, debt, address)
    const [healthFullResult, healthNotFullResult, bandsResult, pricesResult] = await Promise.allSettled([
      llamma.repayHealth(debt, true, address),
      llamma.repayHealth(debt, false, address),
      llamma.repayBands(debt),
      llamma.repayPrices(debt),
    ])

    const healthFull = fulfilledValue(healthFullResult) ?? ''
    const healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
    const bands = fulfilledValue(bandsResult) ?? [0, 0]
    const prices = fulfilledValue(pricesResult) ?? []

    return {
      activeKey,
      resp: {
        healthFull,
        healthNotFull,
        bands: reverseBands(bands),
        prices,
      },
    }
  },
  approve: async (activeKey: string, provider: Provider, llamma: Llamma, debt: string, isFullRepay: boolean) => {
    log('repayApprove', llamma.collateralSymbol, isFullRepay, debt)
    const resp = { activeKey, hashes: [] as string[], error: '' }

    try {
      resp.hashes = isFullRepay ? await llamma.fullRepayApprove() : await llamma.repayApprove(debt)
      await waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  repay: async (activeKey: string, provider: Provider, llamma: Llamma, debt: string, isFullRepay: boolean) => {
    log('repay', llamma.collateralSymbol, isFullRepay, debt)
    const resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = isFullRepay ? await llamma.fullRepay() : await llamma.repay(debt)
      await waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-repay')
      return resp
    }
  },
}

const loanLiquidate = {
  estGasApproval: async (llamma: Llamma, maxSlippage: string) => {
    log('estGasApproval', llamma.collateralSymbol, maxSlippage)
    const resp = { isApproved: false, estimatedGas: initialGas, error: '', warning: '' }

    try {
      resp.isApproved = await llamma.selfLiquidateIsApproved()
      resp.estimatedGas = resp.isApproved
        ? await llamma.estimateGas.selfLiquidate(+maxSlippage)
        : await llamma.estimateGas.selfLiquidateApprove()
      return resp
    } catch (err) {
      console.error(err)
      const haveErrorMessage = err?.message
      if (haveErrorMessage && err.message.includes('not in liquidation mode')) {
        resp.warning = 'warning-not-in-liquidation-mode'
      } else {
        resp.error = getErrorMessage(err, 'error-est-gas-approval')
      }
      return resp
    }
  },
  tokensToLiquidate: async (chainId: ChainId, llamma: Llamma) => {
    log('tokensToLiquidate', llamma.collateralSymbol)
    const resp = { tokensToLiquidate: '', warning: '', error: '' }

    try {
      const [userLoanDetailsResult, tokensToLiquidateResult] = await Promise.allSettled([
        networks[chainId].api.detailInfo.userLoanInfo(llamma, ''),
        llamma.tokensToLiquidate(),
      ])

      const userLoanDetails = fulfilledValue(userLoanDetailsResult) ?? ({} as UserLoanDetails)
      const tokensToLiquidate = fulfilledValue(tokensToLiquidateResult) ?? ''

      if (userLoanDetails?.userLiquidationBand === null) {
        resp.warning = 'warning-not-in-liquidation-mode'
      } else {
        resp.tokensToLiquidate = tokensToLiquidate
      }

      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-liquidate')
      return resp
    }
  },
  approve: async (provider: Provider, llamma: Llamma) => {
    log('selfLiquidateApprove', llamma.collateralSymbol)
    const resp = { hashes: [] as string[], error: '' }
    try {
      resp.hashes = await llamma.selfLiquidateApprove()
      await waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  liquidate: async (provider: Provider, llamma: Llamma, slippage: string) => {
    log('selfLiquidate', llamma.collateralSymbol, slippage)
    const resp = { hash: '', error: '' }
    try {
      resp.hash = await llamma.selfLiquidate(+slippage)
      await waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-liquidate')
      return resp
    }
  },
}

const collateralIncrease = {
  estGasApproval: async (activeKey: string, llamma: Llamma, collateral: string) => {
    log('estGasApproval', llamma.collateralSymbol, collateral)
    const resp = { activeKey, isApproved: false, estimatedGas: initialGas, error: '' }

    try {
      resp.isApproved = await llamma.addCollateralIsApproved(collateral)
      resp.estimatedGas = resp.isApproved
        ? await llamma.estimateGas.addCollateral(collateral)
        : await llamma.estimateGas.addCollateralApprove(collateral)
      return resp
    } catch (err) {
      console.error(err)
      if (err?.message && err.message.includes('liquidation mode')) {
        resp.error = 'error-liquidation-mode'
      } else {
        resp.error = getErrorMessage(err, 'error-est-gas-approval')
      }
      return resp
    }
  },
  detailInfo: async (activeKey: string, llamma: Llamma, collateral: string, address?: string) => {
    log('detailInfo', llamma.collateralSymbol, collateral)
    const [healthFullResult, healthNotFullResult, bandsResult, pricesResult] = await Promise.allSettled([
      llamma.addCollateralHealth(collateral, true, address),
      llamma.addCollateralHealth(collateral, false, address),
      llamma.addCollateralBands(collateral),
      llamma.addCollateralPrices(collateral),
    ])

    const healthFull = fulfilledValue(healthFullResult) ?? ''
    const healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
    const prices = fulfilledValue(pricesResult) ?? []
    const bands = fulfilledValue(bandsResult) ?? [0, 0]

    return {
      activeKey,
      resp: {
        healthFull,
        healthNotFull,
        prices,
        bands: reverseBands(bands),
      },
    }
  },
  approve: async (activeKey: string, provider: Provider, llamma: Llamma, collateral: string) => {
    log('addCollateralApprove', llamma.collateralSymbol, collateral)
    const resp = { activeKey, hashes: [] as string[], error: '' }

    try {
      resp.hashes = await llamma.addCollateralApprove(collateral)
      await waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  addCollateral: async (activeKey: string, provider: Provider, llamma: Llamma, collateral: string) => {
    log('addCollateral', llamma.collateralSymbol, collateral)
    const resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await llamma.addCollateral(collateral)
      await waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      if (error?.message && error.message.includes('liquidation mode')) {
        resp.error = 'error-liquidation-mode'
      } else {
        resp.error = getErrorMessage(error, 'error-step-add-collateral')
      }
      return resp
    }
  },
}

const collateralDecrease = {
  estGas: async (activeKey: string, llamma: Llamma, collateral: string) => {
    log('estGas', llamma.collateralSymbol, collateral)
    const resp = { activeKey, estimatedGas: initialGas, error: '' }

    try {
      resp.estimatedGas = await llamma.removeCollateralEstimateGas(collateral)
      return resp
    } catch (error) {
      console.error(error)
      if (error?.message && error.message.includes('liquidation mode')) {
        resp.error = 'error-liquidation-mode'
      } else {
        resp.error = getErrorMessage(error, 'error-est-gas-approval')
      }
      return resp
    }
  },
  max: async (llamma: Llamma) => {
    log('collateralDecrease', llamma.collateralSymbol, llamma)
    const resp = { maxRemovable: '', error: '' }

    try {
      const maxRemovable = await llamma.maxRemovable()
      resp.maxRemovable = +maxRemovable <= 0 ? '0' : maxRemovable
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-removable')
      return resp
    }
  },
  detailInfo: async (activeKey: string, llamma: Llamma, collateral: string, address?: string) => {
    log('removeCollateralInfo', llamma.collateralSymbol, collateral)

    const [healthFullResult, healthNotFullResult, bandsResult, pricesResult] = await Promise.allSettled([
      llamma.removeCollateralHealth(collateral, true, address),
      llamma.removeCollateralHealth(collateral, false, address),
      llamma.removeCollateralBands(collateral),
      llamma.removeCollateralPrices(collateral),
    ])

    const healthFull = fulfilledValue(healthFullResult) ?? ''
    const healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
    const prices = fulfilledValue(pricesResult) ?? []
    const bands = fulfilledValue(bandsResult) ?? [0, 0]

    return {
      activeKey,
      resp: {
        healthFull,
        healthNotFull,
        prices,
        bands: reverseBands(bands),
      },
    }
  },
  removeCollateral: async (activeKey: string, provider: Provider, llamma: Llamma, collateral: string) => {
    log('removeCollateral', llamma.collateralSymbol, collateral)
    const resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await llamma.removeCollateral(collateral)
      await waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      if (error?.message && error.message.includes('liquidation mode')) {
        resp.error = 'error-liquidation-mode'
      } else {
        resp.error = getErrorMessage(error, 'error-step-remove-collateral')
      }
      return resp
    }
  },
}

const swap = {
  estGasApproval: async (
    activeKey: string,
    llamma: Llamma,
    item1Key: string,
    item2Key: string,
    amount: string,
    maxSlippage: string,
  ) => {
    log('estGasApproval', llamma.collateralSymbol, item1Key, item2Key, amount, maxSlippage)
    const resp = { activeKey, isApproved: false, estimatedGas: initialGas, error: '' }

    try {
      resp.isApproved = await llamma.swapIsApproved(+item1Key, amount)
      resp.estimatedGas = resp.isApproved
        ? await llamma.estimateGas.swap(+item1Key, +item2Key, amount, Number(maxSlippage))
        : await llamma.estimateGas.swapApprove(+item1Key, amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
}

const loanDeleverage = {
  // no approval is needed for deleverage
  estGas: async (activeKey: string, llamma: Llamma, collateral: string, maxSlippage: string) => {
    log('estGas', llamma.collateralSymbol, collateral, maxSlippage)
    const resp = { activeKey, estimatedGas: initialGas, error: '' }
    const slippage = Number(maxSlippage) || 0

    try {
      if (hasV2Leverage(llamma)) {
        const repayArgs = getLeverageV2RepayArgs(collateral)
        await llamma.leverageV2.repayExpectedBorrowed(
          repayArgs.stateCollateral,
          repayArgs.userCollateral,
          repayArgs.userBorrowed,
          slippage,
        )
        resp.estimatedGas = await llamma.leverageV2.estimateGas.repay(
          repayArgs.stateCollateral,
          repayArgs.userCollateral,
          repayArgs.userBorrowed,
          slippage,
        )
      } else {
        resp.estimatedGas = await llamma.deleverage.estimateGas.repay(collateral, slippage)
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  detailInfo: async (
    activeKey: string,
    llamma: Llamma,
    collateral: string,
    address: string,
    maxSlippage: string,
    userState: UserLoanDetails['userState'],
  ) => {
    log('detailInfoDeleverage', llamma.collateralSymbol, collateral, address)
    const resp: FormDetailInfoDeleverage = {
      receiveStablecoin: '',
      isAvailable: false,
      isFullRepayment: false,
      routeName: '',
      priceImpact: '',
      isHighImpact: false,
      healthFull: '',
      healthNotFull: '',
      bands: [0, 0],
      prices: [],
      loading: false,
      error: '',
    }

    try {
      const slippage = Number(maxSlippage) || 0
      if (hasV2Leverage(llamma)) {
        const repayArgs = getLeverageV2RepayArgs(collateral)
        const availabilityCollateral = +userState.collateral > 0 ? userState.collateral : repayArgs.stateCollateral
        const availabilityArgs = getLeverageV2RepayArgs(availabilityCollateral)

        if (+availabilityArgs.stateCollateral > 0) {
          resp.isAvailable = await llamma.leverageV2.repayIsAvailable(
            availabilityArgs.stateCollateral,
            availabilityArgs.userCollateral,
            availabilityArgs.userBorrowed,
            address,
          )
        }

        if (resp.isAvailable && +repayArgs.stateCollateral > 0) {
          const repayExpected = await llamma.leverageV2.repayExpectedBorrowed(
            repayArgs.stateCollateral,
            repayArgs.userCollateral,
            repayArgs.userBorrowed,
            slippage,
          )
          resp.receiveStablecoin = repayExpected.totalBorrowed
          resp.isFullRepayment = await llamma.leverageV2.repayIsFull(
            repayArgs.stateCollateral,
            repayArgs.userCollateral,
            repayArgs.userBorrowed,
            address,
          )

          resp.priceImpact = await llamma.leverageV2.repayPriceImpact(
            repayArgs.stateCollateral,
            repayArgs.userCollateral,
          )
          resp.isHighImpact = isHigherThanMaxSlippage(resp.priceImpact, maxSlippage)
          resp.routeName = ROUTE_AGGREGATOR_LABELS[RouteAggregator.Odos]

          if (!resp.isFullRepayment) {
            const [healthFullResult, healthNotFullResult, bandsResult, pricesResult] = await Promise.allSettled([
              llamma.leverageV2.repayHealth(
                repayArgs.stateCollateral,
                repayArgs.userCollateral,
                repayArgs.userBorrowed,
                true,
                address,
              ),
              llamma.leverageV2.repayHealth(
                repayArgs.stateCollateral,
                repayArgs.userCollateral,
                repayArgs.userBorrowed,
                false,
                address,
              ),
              llamma.leverageV2.repayBands(
                repayArgs.stateCollateral,
                repayArgs.userCollateral,
                repayArgs.userBorrowed,
                address,
              ),
              llamma.leverageV2.repayPrices(
                repayArgs.stateCollateral,
                repayArgs.userCollateral,
                repayArgs.userBorrowed,
                address,
              ),
            ])

            resp.healthFull = fulfilledValue(healthFullResult) ?? ''
            resp.healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
            resp.bands = reverseBands(fulfilledValue(bandsResult) ?? [0, 0])
            resp.prices = fulfilledValue(pricesResult) ?? []
          }
        }
      } else {
        const deleverageCollateral = +userState.collateral > 0 ? userState.collateral : collateral
        if (+deleverageCollateral > 0) {
          resp.isAvailable = await llamma.deleverage.isAvailable(deleverageCollateral)
        }

        if (resp.isAvailable && +collateral > 0) {
          resp.isFullRepayment = await llamma.deleverage.isFullRepayment(collateral)

          const [{ stablecoins, routeIdx }, priceImpact] = await Promise.all([
            llamma.deleverage.repayStablecoins(collateral),
            llamma.deleverage.priceImpact(collateral),
          ])
          resp.receiveStablecoin = stablecoins
          resp.routeName = await llamma.deleverage.getRouteName(routeIdx)
          resp.priceImpact = priceImpact
          resp.isHighImpact = isHigherThanMaxSlippage(priceImpact, maxSlippage)

          if (!resp.isFullRepayment) {
            const [healthFullResult, healthNotFullResult, bandsResult, pricesResult] = await Promise.allSettled([
              llamma.deleverage.repayHealth(collateral, true, address),
              llamma.deleverage.repayHealth(collateral, false, address),
              llamma.deleverage.repayBands(collateral, address),
              llamma.deleverage.repayPrices(collateral, address),
            ])

            resp.healthFull = fulfilledValue(healthFullResult) ?? ''
            resp.healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
            resp.bands = reverseBands(fulfilledValue(bandsResult) ?? [0, 0])
            resp.prices = fulfilledValue(pricesResult) ?? []
          }
        }
      }

      return { activeKey, resp }
    } catch (error) {
      console.warn(error)
      resp.error = getErrorMessage(error, 'error-deleverage-api')
      return { activeKey, resp }
    }
  },
  repay: async (activeKey: string, provider: Provider, llamma: Llamma, collateral: string, maxSlippage: string) => {
    log('deleverageRepay', llamma.collateralSymbol, collateral, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    const slippage = Number(maxSlippage) || 0

    try {
      if (hasV2Leverage(llamma)) {
        const repayArgs = getLeverageV2RepayArgs(collateral)
        await llamma.leverageV2.repayExpectedBorrowed(
          repayArgs.stateCollateral,
          repayArgs.userCollateral,
          repayArgs.userBorrowed,
          slippage,
        )
        resp.hash = await llamma.leverageV2.repay(
          repayArgs.stateCollateral,
          repayArgs.userCollateral,
          repayArgs.userBorrowed,
          slippage,
        )
      } else {
        resp.hash = await llamma.deleverage.repay(collateral, slippage)
      }
      await waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-repay')
      return resp
    }
  },
}

export const crvusdjsApi = {
  detailInfo,

  loanCreate,
  loanIncrease,
  loanDecrease,
  loanDeleverage,
  loanLiquidate,

  collateralIncrease,
  collateralDecrease,

  swap,
}
