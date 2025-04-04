import { BrowserProvider } from 'ethers'
import type { MaxRecvLeverage as MaxRecvLeverageForm } from '@/loan/components/PageLoanCreate/types'
import type { FormDetailInfo as FormDetailInfoDeleverage } from '@/loan/components/PageLoanManage/LoanDeleverage/types'
import type { FormValues as SwapFormValues } from '@/loan/components/PageLoanManage/LoanSwap/types'
import networks from '@/loan/networks'
import type { LiqRange, Provider, MaxRecvLeverage } from '@/loan/store/types'
import { ChainId, LlamalendApi, Llamma, UserLoanDetails } from '@/loan/types/loan.types'
import { fulfilledValue, getErrorMessage, log } from '@/loan/utils/helpers'
import {
  getChartBandBalancesData,
  getIsUserCloseToLiquidation,
  getLiquidationStatus,
  parseUserLoss,
  reverseBands,
  sortBands,
} from '@/loan/utils/utilsCurvejs'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import PromisePool from '@supercharge/promise-pool'

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
  0: { stablecoin: '0', collateral: '0' },
}

const DEFAULT_PARAMETERS = {
  fee: '',
  future_rate: '',
  admin_fee: '',
  rate: '',
  liquidation_discount: '',
  loan_discount: '',
}

const helpers = {
  getLlammaObj: (api: LlamalendApi, token: string) => {
    log('getLlammaObj', token)
    return api.getMintMarket(token)
  },
  getLlammas: (curve: LlamalendApi) => {
    log('getCollaterals', curve.chainId)
    const collaterals = curve.mintMarkets.getMarketList()

    // set mappers
    const llammasMapper: { [llammaId: string]: Llamma } = {}
    for (const idx in collaterals) {
      const collateralName = collaterals[idx]
      const llamma = curve.getMintMarket(collateralName)
      llammasMapper[llamma.id] = llamma
    }

    return llammasMapper
  },
  getUsdRate: async (api: LlamalendApi, tokenAddress: string) => {
    log('getUsdRate', tokenAddress)
    const resp: { usdRate: string | number; error: string } = { usdRate: 0, error: '' }
    try {
      resp.usdRate = await api.getUsdRate(tokenAddress)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-usd-rate')
      resp.usdRate = 'NaN'
      return resp
    }
  },
  getTotalSupply: async (api: LlamalendApi) => {
    log('getTotalSupply', api.chainId)
    const resp = { total: '', minted: '', pegKeepersDebt: '', error: '' }
    try {
      const fetchedTotalSupply = await api.totalSupply()
      return { ...fetchedTotalSupply, error: '' }
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-total-supply')
      return resp
    }
  },
  waitForTransaction: async (hash: string, provider: Provider) =>
    (provider as BrowserProvider).waitForTransaction(hash),
  waitForTransactions: async (hashes: string[], provider: Provider) => {
    const { results, errors } = await PromisePool.for(hashes).process(
      async (hash) => await (provider as BrowserProvider).waitForTransaction(hash),
    )
    if (Array.isArray(errors) && errors.length > 0) {
      throw errors
    } else {
      return results
    }
  },
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

    const parsedBandsBalances = await getChartBandBalancesData(sortBands(bandsBalances), liquidationBand, llamma)

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

    const parsedBandsBalances = await getChartBandBalancesData(
      sortBands(userBandsBalances),
      userLiquidationBand,
      llamma,
    )

    const fetchedUserDetails: UserLoanDetails = {
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
  userTokenBalance: async (api: LlamalendApi, token: string) => {
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
  exists: async (llamma: Llamma, signerAddress: string) => {
    log('loanExists', llamma.collateralSymbol)
    const resp = { loanExists: false, error: '' }
    try {
      if (signerAddress) {
        resp.loanExists = await llamma.loanExists(signerAddress)
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-loan-exists')
      return resp
    }
  },
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

    try {
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

    try {
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

    const [maxRecvsResults, loanBandsResults, loanPricesResults] = await Promise.allSettled([
      haveCollateral
        ? isLeverage
          ? llamma.leverage.createLoanMaxRecvAllRanges(collateral)
          : llamma.createLoanMaxRecvAllRanges(collateral)
        : null,
      haveCollateral && haveDebt
        ? isLeverage
          ? llamma.leverage.createLoanBandsAllRanges(collateral, debt)
          : llamma.createLoanBandsAllRanges(collateral, debt)
        : null,
      haveCollateral && haveDebt
        ? isLeverage
          ? llamma.leverage.createLoanPricesAllRanges(collateral, debt)
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
    try {
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
    try {
      resp.hashes = isLeverage
        ? await llamma.leverage.createLoanApprove(collateral)
        : await llamma.createLoanApprove(collateral)
      await helpers.waitForTransactions(resp.hashes, provider)
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
    try {
      resp.hash = isLeverage
        ? await llamma.leverage.createLoan(collateral, debt, n, +maxSlippage)
        : await llamma.createLoan(collateral, debt, n)
      await helpers.waitForTransaction(resp.hash, provider)
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
  approve: async (activeKey: string, provider: Provider, llamma: Llamma, collateral: string) => {
    const parsedCollateral = collateral || '0'
    log('borrowMoreApprove', llamma.collateralSymbol, parsedCollateral)
    const resp = { hashes: [] as string[], error: '' }

    try {
      resp.hashes = await llamma.borrowMoreApprove(parsedCollateral)
      await helpers.waitForTransactions(resp.hashes, provider)
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
      await helpers.waitForTransaction(resp.hash, provider)
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
      await helpers.waitForTransactions(resp.hashes, provider)
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
      await helpers.waitForTransaction(resp.hash, provider)
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
      await helpers.waitForTransactions(resp.hashes, provider)
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
      await helpers.waitForTransaction(resp.hash, provider)
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
      await helpers.waitForTransactions(resp.hashes, provider)
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
      await helpers.waitForTransaction(resp.hash, provider)
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
    const resp = { activeKey, estimatedGas: 0, error: '' }

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
      await helpers.waitForTransaction(resp.hash, provider)
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
  detailInfoExpected: async (activeKey: string, llamma: Llamma, formValues: SwapFormValues) => {
    const { item1Key, item2Key, item1, item2 } = formValues
    const isExpected = +item1 > 0 // determine if the input value is coming from the FROM textField or To textField
    const amount = isExpected ? item1 : item2
    log('expected, price impact', llamma.collateralSymbol, item1Key, item2Key, amount)

    const [swapExpectedResult, swapPriceImpactResult] = await Promise.allSettled([
      isExpected
        ? llamma.swapExpected(+item1Key, +item2Key, amount)
        : llamma.swapRequired(+item1Key, +item2Key, amount),
      llamma.swapPriceImpact(+item1Key, +item2Key, amount),
    ])

    const swapExpected = fulfilledValue(swapExpectedResult) ?? ''
    const swapPriceImpact = fulfilledValue(swapPriceImpactResult) ?? ''

    return {
      activeKey,
      resp: {
        isExpected,
        amount: swapExpected,
        swapPriceImpact: swapPriceImpact === 'NaN' ? '0' : swapPriceImpact,
      },
    }
  },
  max: async (llamma: Llamma, formValues: SwapFormValues) => {
    const { item1Key, item2Key } = formValues
    log('swapMax', llamma.collateralSymbol, item1Key, item2Key)
    const resp = { maxSwappable: '', error: '' }

    try {
      resp.maxSwappable = await llamma.maxSwappable(+item1Key, +item2Key)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, llamma: Llamma, formValues: SwapFormValues) => {
    const { item1Key, item1 } = formValues
    log('swapApprove', llamma.collateralSymbol, item1Key, item1)
    const resp = { activeKey, hashes: [] as string[], error: '' }

    try {
      resp.hashes = await llamma.swapApprove(+item1Key, item1)
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
    llamma: Llamma,
    formValues: SwapFormValues,
    maxSlippage: string,
  ) => {
    const { item1Key, item2Key, item1 } = formValues
    log('swap', llamma.collateralSymbol, item1Key, item2Key, item1, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await llamma.swap(+item1Key, +item2Key, item1, +maxSlippage)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-swap')
      return resp
    }
  },
}

const loanDeleverage = {
  // no approval is needed for deleverage
  estGas: async (activeKey: string, llamma: Llamma, collateral: string, maxSlippage: string) => {
    log('estGas', llamma.collateralSymbol, collateral, maxSlippage)
    const resp = { activeKey, estimatedGas: 0, error: '' }

    try {
      resp.estimatedGas = await llamma.deleverage.estimateGas.repay(collateral, +maxSlippage)
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
      // check if deleverage is available
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
        resp.isHighImpact = +priceImpact > 0 && +maxSlippage > 0 ? +priceImpact > +maxSlippage : false

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

    try {
      resp.hash = await llamma.deleverage.repay(collateral, +maxSlippage)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-repay')
      return resp
    }
  },
}

export const crvUsdJsApi = {
  helpers,
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
