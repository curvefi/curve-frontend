import type { LiqRange } from '@lend/store/types'
import type { StepStatus } from '@ui/Stepper/types'

import PromisePool from '@supercharge/promise-pool'
import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'

import { INVALID_ADDRESS } from '@lend/constants'
import { fulfilledValue, getErrorMessage, log } from '@lend/utils/helpers'
import { BN, shortenAccount } from '@ui/utils'
import networks from '@lend/networks'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { USE_API } from '@lend/shared/config'
import {
  ChainId,
  Api,
  Provider,
  EstimatedGas,
  MaxRecvLeverageResp,
  LiqRangeResp,
  DetailInfoResp,
  DetailInfoLeverageResp,
  ExpectedCollateral,
  ExpectedBorrowed,
  HeathColorKey,
  MarketStatParameters,
  BandsBalances,
  BandsBalancesArr,
  ParsedBandsBalances,
  MarketStatBands,
  MarketStatTotals,
  MarketStatAmmBalances,
  MarketStatCapAndAvailable,
  MarketMaxLeverage,
  MarketPrices,
  MarketRates,
  MarketTotalLiquidity,
  MarketsTotalCollateralValueMapper,
  RewardOther,
  RewardCrv,
  MarketRewards,
  UserLoanHealth,
  UserLoanState,
  UserLoanDetails,
  UserMarketBalances,
  FutureRates,
  Wallet,
} from '@lend/types/lend.types'

export const helpers = {
  initApi: async (chainId: ChainId, wallet: Wallet) => {
    const { networkId } = networks[chainId]
    const api = cloneDeep((await import('@curvefi/lending-api')).default) as Api
    await api.init('Web3', { network: networkId, externalProvider: _getWalletProvider(wallet) }, { chainId })
    return api
  },
  getImageBaseUrl: (chainId: ChainId) => networks[chainId ?? '1'].imageBaseUrl,
  getIsUserCloseToLiquidation: (
    userFirstBand: number,
    userLiquidationBand: number | null,
    oraclePriceBand: number | null | undefined,
  ) => {
    if (typeof userLiquidationBand !== null && typeof oraclePriceBand !== 'number') {
      return false
    } else if (typeof oraclePriceBand === 'number') {
      return userFirstBand <= oraclePriceBand + 2
    }
    return false
  },
  isTooMuch: (val1: string | number | undefined, val2: string | number | undefined) => {
    val1 = val1 || '0'
    val2 = val2 || '0'
    return BN(val1).isGreaterThan(val2)
  },
  fetchCustomGasFees: async (curve: Api) => {
    let resp: { customFeeData: Record<string, number> | null; error: string } = { customFeeData: null, error: '' }
    try {
      resp.customFeeData = await curve.getGasInfoForL2()
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-gas')
      return resp
    }
  },
  fetchL2GasPrice: async (api: Api) => {
    let resp = { l2GasPriceWei: 0, error: '' }
    try {
      resp.l2GasPriceWei = await api.getGasPriceFromL2()
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-gas')
      return resp
    }
  },
  fetchL1AndL2GasPrice: async (api: Api) => {
    let resp = { l1GasPriceWei: 0, l2GasPriceWei: 0, error: '' }
    try {
      if (networks[api.chainId].gasL2) {
        // const [l2GasPriceWei, l1GasPriceWei] = await Promise.all([api.getGasPriceFromL2(), api.getGasPriceFromL1()])
        // resp.l2GasPriceWei = l2GasPriceWei
        // resp.l1GasPriceWei = l1GasPriceWei
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-get-gas')
      return resp
    }
  },
  getStepStatus: (isComplete: boolean, isInProgress: boolean, isValid: boolean): StepStatus =>
    isComplete ? 'succeeded' : isInProgress ? 'in-progress' : isValid ? 'current' : 'pending',
  getUserActiveKey: (api: Api | null, market: OneWayMarketTemplate) => {
    const { signerAddress } = api ?? {}
    if (!api || !signerAddress || !market) return ''
    return `${market.id}-${shortenAccount(signerAddress)}`
  },
  waitForTransaction: async (hash: string, provider: Provider) => provider.waitForTransaction(hash),
  waitForTransactions: async (hashes: string[], provider: Provider) => {
    const { results, errors } = await PromisePool.for(hashes).process(
      async (hash) => await provider.waitForTransaction(hash),
    )
    if (Array.isArray(errors) && errors.length > 0) {
      throw errors
    } else {
      return results
    }
  },
}

const market = {
  fetchStatsParameters: async (markets: OneWayMarketTemplate[]) => {
    log('fetchStatsParameters', markets.length)
    let results: { [id: string]: MarketStatParameters } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { parameters: null, error }
      })
      .process(async (market) => {
        const parameters = await market.stats.parameters()
        results[market.id] = { parameters, error: '' }
      })

    return results
  },
  fetchStatsBands: async (markets: OneWayMarketTemplate[]) => {
    log('fetchStatsBands', markets.length)
    let results: { [id: string]: MarketStatBands } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, { id }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[id] = { bands: null, error }
      })
      .process(async (market) => {
        const [balances, bandsInfo, bandsBalances] = await Promise.all([
          market.stats.balances(),
          market.stats.bandsInfo(),
          market.stats.bandsBalances(),
        ])

        const { activeBand, minBand, maxBand, liquidationBand } = bandsInfo
        const maxMinBands = [maxBand, minBand]

        const bandBalances = liquidationBand ? await market.stats.bandBalances(liquidationBand) : null
        const parsedBandsBalances = await _fetchChartBandBalancesData(
          _sortBands(bandsBalances),
          liquidationBand,
          market,
          true,
        )

        results[market.id] = {
          bands: {
            balances,
            maxMinBands,
            activeBand,
            liquidationBand,
            bandBalances,
            bandsBalances: parsedBandsBalances,
          },
          error: '',
        }
      })

    return results
  },
  fetchStatsAmmBalances: async (markets: OneWayMarketTemplate[]) => {
    log('fetchStatsAmmBalances', markets.length)
    let results: { [id: string]: MarketStatAmmBalances } = {}
    const useMultiCall = markets.length > 1

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { borrowed: '', collateral: '', error }
      })
      .process(async (market) => {
        const resp = await market.stats.ammBalances(useMultiCall, USE_API)
        results[market.id] = { ...resp, error: '' }
      })

    return results
  },
  fetchStatsCapAndAvailable: async (markets: OneWayMarketTemplate[]) => {
    log('fetchStatsCapAndAvailable', markets.length)
    let results: { [id: string]: MarketStatCapAndAvailable } = {}
    const useMultiCall = markets.length > 1

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { cap: '', available: '', error }
      })
      .process(async (market) => {
        const resp = await market.stats.capAndAvailable(useMultiCall, USE_API)
        results[market.id] = { ...resp, error: '' }
      })

    return results
  },
  fetchStatsTotals: async (markets: OneWayMarketTemplate[]) => {
    log('fetchStatsTotals', markets.length)
    let results: { [id: string]: MarketStatTotals } = {}
    const useMultiCall = markets.length > 1

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { totalDebt: '', error }
      })
      .process(async (market) => {
        const totalDebt = await market.stats.totalDebt(useMultiCall, USE_API)
        results[market.id] = { totalDebt, error: '' }
      })

    return results
  },
  fetchMarketsPrices: async (markets: OneWayMarketTemplate[]) => {
    log('fetchMarketsPrices', markets.length)
    let results: { [id: string]: MarketPrices } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { prices: null, error }
      })
      .process(async (market) => {
        const [oraclePrice, oraclePriceBand, price, basePrice] = await Promise.all([
          market.oraclePrice(),
          market.oraclePriceBand(),
          market.price(),
          market.basePrice(),
        ])

        results[market.id] = {
          prices: {
            oraclePrice,
            oraclePriceBand,
            price,
            basePrice,
          },
          error: '',
        }
      })

    return results
  },
  fetchMarketsRates: async (markets: OneWayMarketTemplate[]) => {
    log('fetchMarketsRates', markets.length)
    const useMultiCall = markets.length > 1
    let results: { [id: string]: MarketRates } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { rates: null, error }
      })
      .process(async (market) => {
        const rates = await market.stats.rates(useMultiCall, USE_API)
        results[market.id] = { rates, error: '' }
      })

    return results
  },
  fetchMarketsVaultsTotalLiquidity: async (markets: OneWayMarketTemplate[]) => {
    log('fetchMarketsVaultsTotalLiquidity', markets.length)
    let results: { [id: string]: MarketTotalLiquidity } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { totalLiquidity: '', error }
      })
      .process(async (market) => {
        const totalLiquidity = await market.vault.totalLiquidity()
        results[market.id] = { totalLiquidity, error: '' }
      })

    return results
  },
  fetchMarketsVaultsRewards: async (markets: OneWayMarketTemplate[]) => {
    const useMultiCall = markets.length > 1
    log('fetchMarketsVaultsRewards', markets.length)
    let results: { [id: string]: MarketRewards } = {}

    await PromisePool.for(markets).process(async (market) => {
      let resp: MarketRewards = {
        rewards: {
          other: [],
          crv: [0, 0],
        },
        error: '',
      }

      // check if gauge is valid
      if (market.addresses.gauge === INVALID_ADDRESS) {
        return resp
      } else {
        const isRewardsOnly = market.vault.rewardsOnly()

        let rewards: { other: RewardOther[]; crv: RewardCrv[] } = {
          other: [],
          crv: [0, 0],
        }

        // isRewardsOnly = both CRV and other comes from same endpoint.
        if (isRewardsOnly) {
          const rewardsResp = await market.vault.rewardsApr(useMultiCall)
          rewards.other = _filterZeroApy(rewardsResp)
        } else {
          const [others, crv] = await Promise.all([
            market.vault.rewardsApr(useMultiCall),
            market.vault.crvApr(useMultiCall),
          ])
          rewards.other = _filterZeroApy(others)
          rewards.crv = crv
        }
        // rewards typescript say APY, but it is actually APR
        resp.rewards = rewards
        results[market.id] = resp
      }
    })

    return results
  },
  fetchMarketsMaxLeverage: async (markets: OneWayMarketTemplate[]) => {
    log('fetchMarketsMaxLeverage', markets.length)
    let results: { [id: string]: MarketMaxLeverage } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { maxLeverage: '', error }
      })
      .process(async (market) => {
        const maxLeverage = market.leverage.hasLeverage() ? await market.leverage.maxLeverage(market?.minBands) : ''
        results[market.id] = { maxLeverage, error: '' }
      })

    return results
  },
  fetchMarketsTotalCollateralValue: async (api: Api, markets: OneWayMarketTemplate[]) => {
    log('fetchMarketsTotalCollateralValue', markets.length)
    let results: MarketsTotalCollateralValueMapper = {}
    const useMultiCall = markets.length > 1

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[market.id] = { total: null, tooltipContent: [], error }
      })
      .process(async (marketData) => {
        const market = marketData
        const { collateral_token, borrowed_token } = market

        const [ammBalance, collateralUsdRate, borrowedUsdRate] = await Promise.all([
          market.stats.ammBalances(useMultiCall, USE_API),
          api.getUsdRate(collateral_token.address),
          api.getUsdRate(borrowed_token.address),
        ])

        if (collateralUsdRate.toString() === 'NaN' || borrowedUsdRate.toString() === 'NaN') {
          results[market.id] = { total: null, tooltipContent: [], error: 'Unable to get usd rate' }
          return
        }

        const borrowedUsd = +ammBalance.borrowed * +borrowedUsdRate
        const collateralUsd = +ammBalance.collateral * +collateralUsdRate
        const total = +borrowedUsd + +collateralUsd

        let tooltipContent: { label: string; value: string }[] = []
        if (total !== 0)
          tooltipContent = [
            { label: collateral_token?.symbol, value: ammBalance.collateral },
            { label: borrowed_token?.symbol, value: ammBalance.borrowed },
          ]

        results[market.id] = { total, tooltipContent, error: '' }
      })

    return results
  },
}

const user = {
  fetchLoansExists: async (api: Api, markets: OneWayMarketTemplate[]) => {
    log('fetchUserLoansExists', api.chainId, markets.length)
    let results: { [userActiveKey: string]: { owmId: string; loanExists: boolean; error: string } } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, market)
        results[userActiveKey] = { owmId: market.id, loanExists: false, error }
      })
      .process(async (market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        const loanExists = await market.userLoanExists()
        results[userActiveKey] = { owmId: market.id, loanExists, error: '' }
      })

    return results
  },
  fetchLoansDetailsHealth: async (api: Api, markets: OneWayMarketTemplate[]) => {
    log('fetchUsersLoansDetailsHealth', api.chainId, markets.length)
    let results: { [userActiveKey: string]: UserLoanHealth } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, market)
        results[userActiveKey] = { healthFull: '', healthNotFull: '', error }
      })
      .process(async (market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        const [healthFull, healthNotFull] = await Promise.all([market.userHealth(), market.userHealth(false)])

        results[userActiveKey] = { healthFull, healthNotFull, error: '' }
      })

    return results
  },
  fetchLoansDetailsState: async (api: Api, markets: OneWayMarketTemplate[]) => {
    log('fetchUsersLoansDetailsState', api.chainId, markets.length)
    let results: { [userActiveKey: string]: UserLoanState } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, market)
        results[userActiveKey] = { collateral: '', borrowed: '', debt: '', N: '', error }
      })
      .process(async (market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        const state = await market.userState()
        results[userActiveKey] = { ...state, error: '' }
      })

    return results
  },
  fetchLoansDetails: async (api: Api, markets: OneWayMarketTemplate[]) => {
    log('fetchUsersLoansDetails', api.chainId, markets.length)
    let results: { [userActiveKey: string]: UserLoanDetails } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, market)
        results[userActiveKey] = {
          details: null,
          error,
        }
      })
      .process(async (market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        const [state, healthFull, healthNotFull, range, bands, prices, bandsBalances, oraclePriceBand, loss] =
          await Promise.all([
            market.userState(),
            market.userHealth(),
            market.userHealth(false),
            market.userRange(),
            market.userBands(),
            market.userPrices(),
            market.userBandsBalances(),
            market.oraclePriceBand(),
            market.userLoss(),
          ])

        const resp = await market.stats.bandsInfo()
        const { liquidationBand } = resp ?? {}

        const reversedUserBands = _reverseBands(bands)
        const isCloseToLiquidation = helpers.getIsUserCloseToLiquidation(
          reversedUserBands[0],
          liquidationBand,
          oraclePriceBand,
        )
        const parsedBandsBalances = await _fetchChartBandBalancesData(
          _sortBands(bandsBalances),
          liquidationBand,
          market,
          false,
        )

        results[userActiveKey] = {
          details: {
            state,
            health: isCloseToLiquidation ? healthNotFull : healthFull,
            healthFull,
            healthNotFull,
            bands: reversedUserBands,
            bandsBalances: parsedBandsBalances,
            bandsPct: range ? await market.calcRangePct(range) : '0',
            isCloseToLiquidation,
            range,
            prices,
            loss,
            status: _getLiquidationStatus(healthNotFull, isCloseToLiquidation, state.borrowed),
          },
          error: '',
        }
      })

    return results
  },
  fetchMarketBalances: async (api: Api, markets: OneWayMarketTemplate[]) => {
    log('fetchUsersMarketBalances', api.chainId, markets.length)
    let results: { [userActiveKey: string]: UserMarketBalances } = {}

    await PromisePool.for(markets)
      .handleError((errorObj, market) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, market)
        results[userActiveKey] = {
          collateral: '',
          borrowed: '',
          vaultShares: '',
          vaultSharesConverted: '',
          gauge: '',
          error,
        }
      })
      .process(async (market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        const resp = await market.wallet.balances()
        let vaultSharesConverted = +resp.vaultShares > 0 ? await market.vault.convertToAssets(resp.vaultShares) : '0'
        results[userActiveKey] = { ...resp, vaultSharesConverted, error: '' }
      })

    return results
  },
}

const loanCreate = {
  maxLeverage: async (market: OneWayMarketTemplate, n: number) => {
    log('maxLeverage', n)
    let resp = { n, maxLeverage: '', error: '' }

    try {
      resp.maxLeverage = await market.leverage.maxLeverage(n)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-api')
      return resp
    }
  },
  maxRecv: async (
    activeKey: string,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    n: number,
    isLeverage: boolean,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'maxRecvLeverage' : 'maxRecv', userBorrowed, userCollateral, n)
    let resp = { activeKey, maxRecv: '', error: '' }

    try {
      if (isLeverage) {
        const maxRecvLeverageResp = await market.leverage.createLoanMaxRecv(userCollateral, userBorrowed, n)
        resp.maxRecv = maxRecvLeverageResp.maxDebt
      } else {
        resp.maxRecv = await market.createLoanMaxRecv(userCollateral, n)
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  detailInfo: async (
    activeKey: string,
    market: OneWayMarketTemplate,
    userCollateral: string,
    debt: string,
    n: number,
  ) => {
    userCollateral = userCollateral || '0'
    debt = debt || '0'
    log('detailInfo', userCollateral, debt, n, 'futureRates', [0, debt])
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }
    try {
      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp] = await Promise.allSettled([
        market.createLoanHealth(userCollateral, debt, n, undefined),
        market.createLoanHealth(userCollateral, debt, n, false),
        market.stats.futureRates(0, debt),
        market.createLoanBands(userCollateral, debt, n),
        market.createLoanPrices(userCollateral, debt, n),
      ])

      const bands = fulfilledValue(bandsResp) ?? [0, 0]

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp) ?? null,
        prices: fulfilledValue(pricesResp) ?? [],
        bands: _reverseBands(bands),
      }
      resp.error = _detailInfoRespErrorMessage(futureRatesResp, bandsResp)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  detailInfoLeverage: async (
    activeKey: string,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    n: number,
    maxSlippage: string,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log('detailInfoLeverage', userCollateral, userBorrowed, debt, n, maxSlippage, 'futureRates', [0, debt])
    let resp: {
      activeKey: string
      resp:
        | (DetailInfoLeverageResp & { expectedCollateral: ExpectedCollateral | null; routeImage: string | null })
        | null
      error: string
    } = { activeKey, resp: null, error: '' }

    try {
      const [expectedCollateralResp] = await Promise.allSettled([
        market.leverage.createLoanExpectedCollateral(userCollateral, userBorrowed, debt, +maxSlippage),
      ])

      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp, routesResp, priceImpactResp] =
        await Promise.allSettled([
          market.leverage.createLoanHealth(userCollateral, userBorrowed, debt, n),
          market.leverage.createLoanHealth(userCollateral, userBorrowed, debt, n, false),
          market.stats.futureRates(0, debt),
          market.leverage.createLoanBands(userCollateral, userBorrowed, debt, n),
          market.leverage.createLoanPrices(userCollateral, userBorrowed, debt, n),
          market.leverage.createLoanRouteImage(userBorrowed, debt),
          market.leverage.createLoanPriceImpact(userBorrowed, debt),
        ])

      const bands = fulfilledValue(bandsResp) ?? [0, 0]

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp) ?? null,
        bands: _reverseBands(bands),
        prices: fulfilledValue(pricesResp) ?? [],
        routeImage: fulfilledValue(routesResp) ?? null,
        expectedCollateral: fulfilledValue(expectedCollateralResp) ?? null,
        ..._getPriceImpactResp(priceImpactResp, maxSlippage),
      }
      resp.error = _detailInfoRespErrorMessage(futureRatesResp, bandsResp)

      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  liqRanges: async (
    activeKey: string,
    market: OneWayMarketTemplate,
    totalCollateral: string | undefined,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    isLeverage: boolean,
  ) => {
    totalCollateral = totalCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'LiqRangesLeverage' : 'liqRanges', totalCollateral, userCollateral, userBorrowed, debt)

    const { minBands, maxBands } = market
    const bands = Array.from({ length: +maxBands - +minBands + 1 }, (_, i) => i + minBands)
    let liqRangesList: LiqRange[] = []
    let liqRangesListMapper: { [n: string]: LiqRange & { sliderIdx: number } } = {}
    let sliderIdx = 0

    if (isLeverage) {
      const [maxRecvsResults, loanBandsResults, loanPricesResults] = await Promise.allSettled([
        market.leverage.createLoanMaxRecvAllRanges(userCollateral, userBorrowed),
        market.leverage.createLoanBandsAllRanges(userCollateral, userBorrowed, debt),
        market.leverage.createLoanPricesAllRanges(userCollateral, userBorrowed, debt),
      ])

      const maxRecvs = fulfilledValue(maxRecvsResults) ?? null
      const loanPrices = fulfilledValue(loanPricesResults) ?? null
      const loanBands = fulfilledValue(loanBandsResults) ?? null

      for (const n of bands) {
        const bands = loanBands?.[n]
        const maxRecv = maxRecvs?.[n]?.maxDebt
        const nLoanPrices = loanPrices?.[n]

        const detail: LiqRange = {
          n: Number(n),
          collateral: isLeverage ? totalCollateral : userBorrowed,
          debt,
          maxRecv: maxRecv || '',
          maxRecvError: maxRecvsResults.status === 'rejected' ? maxRecvsResults.reason : '',
          prices: nLoanPrices ? [nLoanPrices[1], nLoanPrices[0]] : [],
          bands: bands ? _reverseBands(bands) : [0, 0],
        }
        liqRangesList.push(detail)
        liqRangesListMapper[n] = { ...detail, sliderIdx }
        sliderIdx++
      }
    } else {
      const [maxRecvsResults, loanBandsResults, loanPricesResults] = await Promise.allSettled([
        market.createLoanMaxRecvAllRanges(userCollateral),
        market.createLoanBandsAllRanges(userCollateral, debt),
        market.createLoanPricesAllRanges(userCollateral, debt),
      ])

      const maxRecvs = fulfilledValue(maxRecvsResults) ?? null
      const loanPrices = fulfilledValue(loanPricesResults) ?? null
      const loanBands = fulfilledValue(loanBandsResults) ?? null

      for (const n of bands) {
        const bands = loanBands?.[n]
        const maxRecv = maxRecvs?.[n]
        const nLoanPrices = loanPrices?.[n]

        const detail: LiqRangeResp = {
          n: Number(n),
          collateral: userCollateral,
          debt,
          maxRecv: maxRecv || '',
          maxRecvError: maxRecvsResults.status === 'rejected' ? maxRecvsResults.reason : '',
          prices: nLoanPrices ? [nLoanPrices[1], nLoanPrices[0]] : [],
          bands: bands ? _reverseBands(bands) : [0, 0],
        }
        liqRangesList.push(detail)
        liqRangesListMapper[n] = { ...detail, sliderIdx }
        sliderIdx++
      }
    }

    return {
      activeKey,
      liqRanges: liqRangesList,
      liqRangesMapper: liqRangesListMapper,
    }
  },
  estGasApproval: async (
    activeKey: string,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    n: number,
    maxSlippage: string,
    isLeverage: boolean,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'estGasApprovalLeverage' : 'estGasApproval', userCollateral, userBorrowed, debt, n, maxSlippage)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = isLeverage
        ? await market.leverage.createLoanIsApproved(userCollateral, userBorrowed)
        : await market.createLoanIsApproved(userCollateral)
      resp.estimatedGas = resp.isApproved
        ? isLeverage
          ? await market.leverage.estimateGas.createLoan(userCollateral, userBorrowed, debt, n, +maxSlippage)
          : await market.estimateGas.createLoan(userCollateral, debt, n)
        : isLeverage
          ? await market.leverage.estimateGas.createLoanApprove(userCollateral, userBorrowed)
          : await market.estimateGas.createLoanApprove(userCollateral)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    isLeverage: boolean,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'approveLeverage' : 'approve', userCollateral, userBorrowed)
    const fn = async () =>
      isLeverage
        ? await market.leverage.createLoanApprove(userCollateral, userBorrowed)
        : await market.createLoanApprove(userCollateral)
    return await approve(activeKey, fn, provider)
  },
  create: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    n: number,
    maxSlippage: string,
    isLeverage: boolean,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'createLeverage' : 'create', userCollateral, userBorrowed, debt, n, maxSlippage)
    const fn = async () =>
      isLeverage
        ? await market.leverage.createLoan(userCollateral, userBorrowed, debt, n, +maxSlippage)
        : await market.createLoan(userCollateral, debt, n)
    return await submit(activeKey, fn, provider)
  },
}

const loanBorrowMore = {
  maxRecv: async (market: OneWayMarketTemplate, activeKey: string, userCollateral: string) => {
    userCollateral = userCollateral || '0'
    log('maxRecv', userCollateral)
    let resp = { activeKey, maxRecv: '', error: '' }

    try {
      const maxRecv = await market.borrowMoreMaxRecv(userCollateral)
      resp.maxRecv = +maxRecv < 0 ? '0' : maxRecv
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  maxRecvLeverage: async (
    market: OneWayMarketTemplate,
    activeKey: string,
    userCollateral: string,
    userBorrowed: string,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log('maxRecvLeverage', userCollateral, userBorrowed)

    let resp: { activeKey: string; maxRecv: MaxRecvLeverageResp | null; error: string } = {
      activeKey,
      maxRecv: null,
      error: '',
    }

    try {
      resp.maxRecv = await market.leverage.borrowMoreMaxRecv(userCollateral, userBorrowed)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  detailInfo: async (
    activeKey: string,
    { signerAddress }: Api,
    market: OneWayMarketTemplate,
    userCollateral: string,
    debt: string,
  ) => {
    userCollateral = userCollateral || '0'
    debt = debt || '0'
    log('loanBorrowMoreHealthsBandsPrices', userCollateral, debt, 'futureRates', [0, debt])
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }

    try {
      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp] = await Promise.allSettled([
        signerAddress ? market.borrowMoreHealth(userCollateral, debt, true) : '',
        signerAddress ? market.borrowMoreHealth(userCollateral, debt, false) : '',
        market.stats.futureRates(0, debt),
        market.borrowMoreBands(userCollateral, debt),
        market.borrowMorePrices(userCollateral, debt),
      ])

      const bands = fulfilledValue(bandsResp) ?? [0, 0]

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp) ?? null,
        prices: fulfilledValue(pricesResp) ?? [],
        bands: _reverseBands(bands),
      }
      resp.error = _detailInfoRespErrorMessage(futureRatesResp, bandsResp)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  detailInfoLeverage: async (
    activeKey: string,
    { signerAddress }: Api,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    slippage: string,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log('detailInfoLeverage', userCollateral, userBorrowed, debt, 'futureRates', [0, debt], slippage)
    let resp: {
      activeKey: string
      resp:
        | (DetailInfoLeverageResp & {
            expectedCollateral: Omit<ExpectedCollateral, 'leverage'> | null
            routeImage: string | null
          })
        | null
      error: string
    } = { activeKey, resp: null, error: '' }

    try {
      // expected need to be called before the other functions
      const [expectedCollateralResp] = await Promise.allSettled([
        market.leverage.borrowMoreExpectedCollateral(userCollateral, userBorrowed, debt, +slippage),
      ])

      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp, routesResp, priceImpactResp] =
        await Promise.allSettled([
          signerAddress ? market.leverage.borrowMoreHealth(userCollateral, userBorrowed, debt, true) : '',
          signerAddress ? market.leverage.borrowMoreHealth(userCollateral, userBorrowed, debt, false) : '',
          market.stats.futureRates(0, debt),
          market.leverage.borrowMoreBands(userCollateral, userBorrowed, debt),
          market.leverage.borrowMorePrices(userCollateral, userBorrowed, debt),
          market.leverage.borrowMoreRouteImage(userBorrowed, debt),
          market.leverage.borrowMorePriceImpact(userBorrowed, debt),
        ])

      const bands = fulfilledValue(bandsResp) ?? []

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp) ?? null,
        prices: fulfilledValue(pricesResp) ?? [],
        bands: _reverseBands(bands),
        expectedCollateral: fulfilledValue(expectedCollateralResp) ?? null,
        routeImage: fulfilledValue(routesResp) ?? null,
        ..._getPriceImpactResp(priceImpactResp, slippage),
      }
      resp.error = _detailInfoRespErrorMessage(futureRatesResp, bandsResp)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  estGasApproval: async (
    activeKey: string,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    maxSlippage: string,
    isLeverage: boolean,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'estGasApprovalLeverage' : 'estGasApproval', userCollateral, userBorrowed, debt, maxSlippage)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = isLeverage
        ? await market.leverage.borrowMoreIsApproved(userCollateral, userBorrowed)
        : await market.borrowMoreIsApproved(userCollateral)
      resp.estimatedGas = resp.isApproved
        ? isLeverage
          ? await market.leverage.estimateGas.borrowMore(userCollateral, userBorrowed, debt, +maxSlippage)
          : await market.estimateGas.borrowMore(userCollateral, debt)
        : isLeverage
          ? await market.leverage.estimateGas.borrowMoreApprove(userCollateral, userBorrowed)
          : await market.estimateGas.borrowMoreApprove(userCollateral)
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
  approve: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    isLeverage: boolean,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'approveLeverage' : 'approve', userCollateral, userBorrowed)
    const fn = async () =>
      isLeverage
        ? await market.leverage.borrowMoreApprove(userCollateral, userBorrowed)
        : await market.borrowMoreApprove(userCollateral)
    return await approve(activeKey, fn, provider)
  },
  borrowMore: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    maxSlippage: string,
    isLeverage: boolean,
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'borrowMoreLeverage' : 'borrowMore', userCollateral, userBorrowed, debt, maxSlippage)
    const fn = async () =>
      isLeverage
        ? await market.leverage.borrowMore(userCollateral, userBorrowed, debt, +maxSlippage)
        : await market.borrowMore(userCollateral, debt)
    return await submit(activeKey, fn, provider)
  },
}

const loanRepay = {
  repayIsAvailableLeverage: async (
    market: OneWayMarketTemplate,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log('repayIsAvailableLeverage', stateCollateral, userCollateral, userBorrowed)
    let resp: { repayIsAvailable: boolean | null; error: string } = { repayIsAvailable: null, error: '' }

    try {
      resp.repayIsAvailable = await market.leverage.repayIsAvailable(stateCollateral, userCollateral, userBorrowed)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-api')
      return resp
    }
  },
  detailInfo: async (
    activeKey: string,
    { signerAddress }: Api,
    market: OneWayMarketTemplate,
    userBorrowed: string,
    isFullRepay: boolean,
    userStateDebt: string,
  ) => {
    log('detailInfo', userBorrowed)
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }

    try {
      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp] = await Promise.allSettled([
        signerAddress && !isFullRepay ? market.repayHealth(userBorrowed, true) : '',
        signerAddress && !isFullRepay ? market.repayHealth(userBorrowed, false) : '',
        market.stats.futureRates(0, `-${isFullRepay ? userStateDebt : userBorrowed}`),
        isFullRepay ? ([0, 0] as [number, number]) : market.repayBands(userBorrowed),
        isFullRepay ? ['', ''] : market.repayPrices(userBorrowed),
      ])

      const bands = fulfilledValue(bandsResp) ?? [0, 0]

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp) ?? null,
        prices: fulfilledValue(pricesResp) ?? [],
        bands: _reverseBands(bands),
      }
      resp.error = _detailInfoRespErrorMessage(futureRatesResp, bandsResp)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  detailInfoLeverage: async (
    activeKey: string,
    { signerAddress }: Api,
    market: OneWayMarketTemplate,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    maxSlippage: string,
    userStateDebt: string,
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log('detailInfoLeverage', stateCollateral, userCollateral, userBorrowed, maxSlippage)

    let resp: {
      activeKey: string
      resp:
        | (DetailInfoLeverageResp & {
            repayIsAvailable: boolean
            repayIsFull: boolean
            expectedBorrowed: ExpectedBorrowed | null
            routeImage: string | null
          })
        | null
      error: string
    } = { activeKey, resp: null, error: '' }

    try {
      const [expectedBorrowedResp] = await Promise.allSettled([
        market.leverage.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed, +maxSlippage),
      ])

      const expectedBorrowed = fulfilledValue(expectedBorrowedResp) ?? null

      const [repayIsFullResp] = await Promise.allSettled([
        market.leverage.repayIsFull(stateCollateral, userCollateral, userBorrowed),
      ])

      const repayIsFull = fulfilledValue(repayIsFullResp) ?? false

      const [
        healthFullResp,
        healthNotFullResp,
        futureRatesResp,
        bandsResp,
        pricesResp,
        routesResp,
        priceImpactResp,
        repayIsAvailableResp,
      ] = await Promise.allSettled([
        signerAddress ? market.leverage.repayHealth(stateCollateral, userCollateral, userBorrowed, true) : '',
        signerAddress ? market.leverage.repayHealth(stateCollateral, userCollateral, userBorrowed, false) : '',
        market.stats.futureRates(0, `-${repayIsFull ? userStateDebt : expectedBorrowed?.totalBorrowed}`),
        repayIsFull
          ? ([0, 0] as [number, number])
          : market.leverage.repayBands(stateCollateral, userCollateral, userBorrowed),
        repayIsFull ? ['', ''] : market.leverage.repayPrices(stateCollateral, userCollateral, userBorrowed),
        market.leverage.repayRouteImage(stateCollateral, userCollateral),
        market.leverage.repayPriceImpact(stateCollateral, userCollateral),
        market.leverage.repayIsAvailable(stateCollateral, userCollateral, userBorrowed),
      ])

      const bands = fulfilledValue(bandsResp) ?? []

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp),
        prices: fulfilledValue(pricesResp) ?? [],
        bands: _reverseBands(bands),
        repayIsAvailable: fulfilledValue(repayIsAvailableResp) ?? false,
        repayIsFull,
        expectedBorrowed,
        routeImage: fulfilledValue(routesResp) ?? null,
        ..._getPriceImpactResp(priceImpactResp, maxSlippage),
      }
      resp.error = _detailInfoRespErrorMessage(futureRatesResp, bandsResp)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  estGasApproval: async (
    activeKey: string,
    market: OneWayMarketTemplate,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    isFullRepay: boolean,
    maxSlippage: string,
    isLeverage: boolean,
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(
      isLeverage ? 'estGasApprovalLeverage' : 'estGasApproval',
      stateCollateral,
      userCollateral,
      userBorrowed,
      isFullRepay,
      maxSlippage,
    )
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = isLeverage
        ? await market.leverage.repayIsApproved(userCollateral, userBorrowed)
        : isFullRepay
          ? await market.fullRepayIsApproved()
          : await market.repayIsApproved(userBorrowed)
      resp.estimatedGas = isLeverage
        ? resp.isApproved
          ? await market.leverage.estimateGas.repay(stateCollateral, userCollateral, userBorrowed, +maxSlippage)
          : await market.leverage.estimateGas.repayApprove(userCollateral, userBorrowed)
        : resp.isApproved
          ? isFullRepay
            ? await market.estimateGas.fullRepay()
            : await market.estimateGas.repay(userBorrowed)
          : isFullRepay
            ? await market.estimateGas.fullRepayApprove()
            : await market.estimateGas.repayApprove(userBorrowed)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    isFullRepay: boolean,
    isLeverage: boolean,
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'approveLeverage' : 'approve', stateCollateral, userCollateral, userBorrowed, isFullRepay)
    const fn = async () =>
      isLeverage
        ? await market.leverage.repayApprove(userCollateral, userBorrowed)
        : isFullRepay
          ? await market.fullRepayApprove()
          : await market.repayApprove(userBorrowed)
    return await approve(activeKey, fn, provider)
  },
  repay: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    isFullRepay: boolean,
    maxSlippage: string,
    isLeverage: boolean,
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'repayLeverage' : 'repay', stateCollateral, userCollateral, userBorrowed, isFullRepay, maxSlippage)
    const fn = async () =>
      isLeverage
        ? await market.leverage.repay(stateCollateral, userCollateral, userBorrowed, +maxSlippage)
        : isFullRepay
          ? await market.fullRepay()
          : await market.repay(userBorrowed)
    return await submit(activeKey, fn, provider)
  },
}

const loanSelfLiquidation = {
  detailInfo: async (api: Api, market: OneWayMarketTemplate, slippage: string) => {
    log('detailInfo', slippage)
    const resp: { tokensToLiquidate: string; futureRates: FutureRates | null; error: string } = {
      tokensToLiquidate: '',
      futureRates: null,
      error: '',
    }

    try {
      resp.tokensToLiquidate = await market.tokensToLiquidate()
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-api')
    }

    if (!resp.error && +resp.tokensToLiquidate > 0) {
      try {
        resp.futureRates = await market.stats.futureRates(0, `-${resp.tokensToLiquidate}`)
      } catch (error) {
        console.error(error)
        resp.error = getErrorMessage(error, 'error-api')
      }
    }
    return resp
  },
  estGasApproval: async (market: OneWayMarketTemplate, maxSlippage: string) => {
    log('loanSelfLiquidationEstGasApproval', market.collateral_token.symbol, maxSlippage)
    let resp = { isApproved: false, estimatedGas: null as EstimatedGas, error: '', warning: '' }

    try {
      resp.isApproved = await market.selfLiquidateIsApproved()
      resp.estimatedGas = resp.isApproved
        ? await market.estimateGas.selfLiquidate(+maxSlippage)
        : await market.estimateGas.selfLiquidateApprove()
      return resp
    } catch (err) {
      console.error(err)
      resp.error = getErrorMessage(err, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (provider: Provider, market: OneWayMarketTemplate) => {
    log('approve')
    const fn = async () => await market.selfLiquidateApprove()
    return await approve('', fn, provider)
  },
  selfLiquidate: async (provider: Provider, market: OneWayMarketTemplate, slippage: string) => {
    log('selfLiquidate', slippage)
    const fn = async () => await market.selfLiquidate(+slippage)
    return await submit('', fn, provider)
  },
}

const loanCollateralAdd = {
  detailInfo: async (
    activeKey: string,
    { signerAddress }: Api,
    market: OneWayMarketTemplate,
    collateral: string,
    address?: string,
  ) => {
    log('detailInfo', collateral)
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }
    try {
      const [healthFull, healthNotFull, bands, prices] = await Promise.all([
        signerAddress ? market.addCollateralHealth(collateral, true, address) : '',
        signerAddress ? market.addCollateralHealth(collateral, false, address) : '',
        market.addCollateralBands(collateral),
        market.addCollateralPrices(collateral),
      ])

      resp.resp = {
        healthFull,
        healthNotFull,
        futureRates: null,
        prices,
        bands: _reverseBands(bands),
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  estGasApproval: async (activeKey: string, market: OneWayMarketTemplate, collateral: string) => {
    log('estGasApproval', collateral)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await market.addCollateralIsApproved(collateral)
      resp.estimatedGas = resp.isApproved
        ? await market.estimateGas.addCollateral(collateral)
        : await market.estimateGas.addCollateralApprove(collateral)
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
  approve: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, userCollateral: string) => {
    log('approve', userCollateral)
    const fn = async () => await market.addCollateralApprove(userCollateral)
    return await approve(activeKey, fn, provider)
  },
  addCollateral: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    userCollateral: string,
  ) => {
    log('addCollateral', userCollateral)
    const fn = async () => await market.addCollateral(userCollateral)
    return await submit(activeKey, fn, provider)
  },
}

const loanCollateralRemove = {
  maxRemovable: async (market: OneWayMarketTemplate) => {
    log('loanCollateralRemoveMax', market.collateral_token.symbol)
    let resp = { maxRemovable: '', error: '' }

    try {
      const maxRemovable = await market.maxRemovable()
      resp.maxRemovable = +maxRemovable <= 0 ? '0' : maxRemovable
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-removable')
      return resp
    }
  },
  detailInfo: async (
    activeKey: string,
    { signerAddress }: Api,
    market: OneWayMarketTemplate,
    collateral: string,
    address?: string,
  ) => {
    log('loanCollateralRemoveHealthPricesBands', market.collateral_token.symbol, collateral)
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }
    try {
      const [healthFull, healthNotFull, bands, prices] = await Promise.all([
        signerAddress ? market.removeCollateralHealth(collateral, true, address) : '',
        signerAddress ? market.removeCollateralHealth(collateral, false, address) : '',
        market.removeCollateralBands(collateral),
        market.removeCollateralPrices(collateral),
      ])

      resp.resp = {
        healthFull,
        healthNotFull,
        futureRates: null,
        prices,
        bands: _reverseBands(bands),
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  estGas: async (activeKey: string, market: OneWayMarketTemplate, collateral: string) => {
    log('loanCollateralRemoveEstGas', market.collateral_token.symbol, collateral)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await market.removeCollateralEstimateGas(collateral)
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
  removeCollateral: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    userCollateral: string,
  ) => {
    log('removeCollateral', userCollateral)
    const fn = async () => await market.removeCollateral(userCollateral)
    return await submit(activeKey, fn, provider)
  },
}

// VAULT
const vaultDeposit = {
  max: async (market: OneWayMarketTemplate) => {
    log('vaultDepositMax', market.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await market.vault.maxDeposit()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultDepositPreview', market.id, amount, 'futureRates', [amount, 0])
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      const [preview, futureRates] = await Promise.all([
        market.vault.previewDeposit(amount),
        market.stats.futureRates(amount, 0),
      ])
      resp.preview = preview
      resp.futureRates = futureRates
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  estGasApproval: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultDepositEstGas', market.id, amount)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await market.vault.depositIsApproved(amount)
      resp.estimatedGas = resp.isApproved
        ? await market.vault.estimateGas.deposit(amount)
        : await market.vault.estimateGas.depositApprove(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultDepositApprove', market.id, amount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await market.vault.depositApprove(amount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  deposit: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultDeposit', market.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await market.vault.deposit(amount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-deposit')
      return resp
    }
  },
}

const vaultMint = {
  max: async (market: OneWayMarketTemplate) => {
    log('vaultMintMax', market.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await market.vault.maxMint()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultMintPreview', market.id, amount, 'futureRates', [amount, 0])
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      const [preview, futureRates] = await Promise.all([
        market.vault.previewMint(amount),
        market.stats.futureRates(amount, 0),
      ])
      resp.preview = preview
      resp.futureRates = futureRates
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  estGasApproval: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultMintEstGasApproval', market.id, amount)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await market.vault.mintIsApproved(amount)
      resp.estimatedGas = resp.isApproved
        ? await market.vault.estimateGas.mint(amount)
        : await market.vault.estimateGas.mintApprove(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultMintApprove', market.id, amount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await market.vault.mintApprove(amount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  mint: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultMint', market.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await market.vault.mint(amount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-deposit')
      return resp
    }
  },
}

const vaultStake = {
  estGasApproval: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultStakeEstGasApproval', market.id, amount)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await market.vault.stakeIsApproved(amount)
      resp.estimatedGas = resp.isApproved
        ? await market.vault.estimateGas.stake(amount)
        : await market.vault.estimateGas.stakeApprove(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultStakeApprove', market.id, amount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await market.vault.stakeApprove(amount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  stake: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultStake', market.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await market.vault.stake(amount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-deposit')
      return resp
    }
  },
}

const vaultWithdraw = {
  max: async (market: OneWayMarketTemplate) => {
    log('vaultWithdrawMax', market.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await market.vault.maxWithdraw()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultWithdrawPreviewFutureRates', market.id, amount, 'futureRates', [`-${amount}`, 0])
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      const [preview, futureRates] = await Promise.all([
        market.vault.previewWithdraw(amount),
        market.stats.futureRates(`-${amount}`, 0),
      ])
      resp.preview = preview
      resp.futureRates = futureRates
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  estGas: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultWithdrawEstGas', market.id, amount)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await market.vault.estimateGas.withdraw(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  withdraw: async (
    activeKey: string,
    provider: Provider,
    market: OneWayMarketTemplate,
    isFullWithdraw: boolean,
    amount: string,
    vaultShares: string,
  ) => {
    log('vaultWithdraw', market.id, amount, 'isFullWithdraw', isFullWithdraw, 'vaultShares', vaultShares)

    const resp = { activeKey, hash: '', error: '' }
    try {
      // if isFUllWithdraw which means max === vaultSharesConverted, use redeem(walletBalances.vaultShares)
      // else use withdraw(amount)
      resp.hash = isFullWithdraw ? await market.vault.redeem(vaultShares) : await market.vault.withdraw(amount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-deposit')
      return resp
    }
  },
}

const vaultRedeem = {
  max: async (market: OneWayMarketTemplate) => {
    log('vaultRedeemMax', market.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await market.vault.maxRedeem()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultRedeemPreview', market.id, amount)
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      resp.preview = await market.vault.previewRedeem(amount)
      log('vaultRedeemFutureRates', [`-${resp.preview}`, 0])
      resp.futureRates = await market.stats.futureRates(`-${resp.preview}`, 0)
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  estGas: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultRedeemEstGas', market.id, amount)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await market.vault.estimateGas.redeem(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  redeem: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultRedeem', market.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await market.vault.redeem(amount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step')
      return resp
    }
  },
}

const vaultUnstake = {
  estGas: async (activeKey: string, market: OneWayMarketTemplate, amount: string) => {
    log('vaultUnstakeEstGas', market.id, amount)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await market.vault.estimateGas.unstake(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  unstake: async (activeKey: string, provider: Provider, market: OneWayMarketTemplate, amount: string) => {
    log('vaultUnstake', market.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await market.vault.unstake(amount)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-deposit')
      return resp
    }
  },
}

// resp.claimable.crv = '372.02222664646'
// resp.claimable.rewards = [
//   { token: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', amount: '300.54654646134' },
// ]
const vaultClaim = {
  claimable: async (userActiveKey: string, market: OneWayMarketTemplate) => {
    log('vaultClaimable', market.id)
    let resp = {
      userActiveKey,
      claimable: { crv: '', rewards: [] as { token: string; symbol: string; amount: string }[] },
      error: '',
    }

    try {
      const [crv, rewards] = await Promise.all([market.vault.claimableCrv(), market.vault.claimableRewards()])
      resp.claimable.crv = crv
      resp.claimable.rewards = rewards
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  claimCrv: async (userActiveKey: string, provider: Provider, market: OneWayMarketTemplate) => {
    log('vaultClaim', market.id)
    const resp = { userActiveKey, hash: '', error: '' }
    try {
      resp.hash = await market.vault.claimCrv()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-claim')
      return resp
    }
  },
  claimRewards: async (userActiveKey: string, provider: Provider, market: OneWayMarketTemplate) => {
    log('vaultClaim', market.id)
    const resp = { userActiveKey, hash: '', error: '' }
    try {
      resp.hash = await market.vault.claimRewards()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-claim')
      return resp
    }
  },
}

const apiLending = {
  helpers,

  user,
  market,

  loanCreate,
  loanBorrowMore,
  loanRepay,
  loanSelfLiquidation,
  loanCollateralAdd,
  loanCollateralRemove,

  vaultDeposit,
  vaultMint,
  vaultWithdraw,
  vaultRedeem,
  vaultStake,
  vaultUnstake,
  vaultClaim,
}

export default apiLending

function _getWalletProvider(wallet: Wallet) {
  if ('isTrustWallet' in wallet.provider) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum
  } else if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}

function _getLiquidationStatus(healthNotFull: string, userIsCloseToLiquidation: boolean, userStateStablecoin: string) {
  let userStatus: { label: string; colorKey: HeathColorKey; tooltip: string } = {
    label: 'Healthy',
    colorKey: 'healthy',
    tooltip: '',
  }

  if (+healthNotFull < 0) {
    userStatus.label = 'Hard liquidation'
    userStatus.colorKey = 'hard_liquidation'
    userStatus.tooltip =
      'Hard liquidation is like a usual liquidation, which can happen only if you experience significant losses in soft liquidation so that you get below 0 health.'
  } else if (+userStateStablecoin > 0) {
    userStatus.label = 'Soft liquidation'
    userStatus.colorKey = 'soft_liquidation'
    userStatus.tooltip =
      'Soft liquidation is the initial process of collateral being converted into stablecoin, you may experience some degree of loss.'
  } else if (userIsCloseToLiquidation) {
    userStatus.label = 'Close to liquidation'
    userStatus.colorKey = 'close_to_liquidation'
  }

  return userStatus
}

function _reverseBands(bands: [number, number] | number[]) {
  return [bands[1], bands[0]] as [number, number]
}

function _sortBands(bandsBalances: { [index: number]: { borrowed: string; collateral: string } }) {
  const sortedKeys = sortBy(Object.keys(bandsBalances), (k) => +k)
  const bandsBalancesArr: { borrowed: string; collateral: string; band: number }[] = []
  for (const k of sortedKeys) {
    // @ts-ignore
    bandsBalancesArr.push({ ...bandsBalances[k], band: k })
  }
  return { bandsBalancesArr, bandsBalances }
}

async function _fetchChartBandBalancesData(
  { bandsBalances, bandsBalancesArr }: { bandsBalances: BandsBalances; bandsBalancesArr: BandsBalancesArr },
  liquidationBand: number | null,
  market: OneWayMarketTemplate,
  isMarket: boolean,
) {
  // filter out bands that doesn't have borrowed or collaterals
  const ns = isMarket
    ? bandsBalancesArr
        .filter((b) => {
          const { borrowed, collateral } = bandsBalances[b.band] ?? {}
          return +borrowed > 0 || +collateral > 0
        })
        .map((b) => b.band)
    : bandsBalancesArr.map((b) => b.band)

  // TODO: handle errors
  const { results } = await PromisePool.for(ns).process(async (n) => {
    const { collateral, borrowed } = bandsBalances[n]
    const [p_up, p_down] = await market.calcBandPrices(+n)
    const sqrt = new BN(p_up).multipliedBy(p_down).squareRoot()
    const pUpDownMedian = new BN(p_up).plus(p_down).dividedBy(2).toString()
    const collateralUsd = new BN(collateral).multipliedBy(sqrt)

    return {
      borrowed,
      collateral,
      collateralUsd: collateralUsd.toString(),
      collateralBorrowedUsd: collateralUsd.plus(borrowed).toNumber(),
      isLiquidationBand: liquidationBand ? (liquidationBand === +n ? 'SL' : '') : '',
      isOraclePriceBand: false, // update this with detail info oracle price
      isNGrouped: false,
      n: n.toString(),
      p_up,
      p_down,
      pUpDownMedian,
    } as ParsedBandsBalances
  })

  let parsedBandBalances = []
  for (const idx in results) {
    const r = results[idx]
    parsedBandBalances.unshift(r)
  }
  return parsedBandBalances
}

// TODO: refactor shared between pool and lend
function _filterZeroApy(others: RewardOther[]) {
  return Array.isArray(others) ? others.filter(({ apy }) => +apy > 0) : ([] as RewardOther[])
}

async function approve(activeKey: string, approveFn: () => Promise<string[]>, provider: Provider) {
  let resp = { activeKey, hashes: [] as string[], error: '' }
  try {
    resp.hashes = await approveFn()
    await helpers.waitForTransactions(resp.hashes, provider)
    return resp
  } catch (error) {
    console.error(error)
    resp.error = getErrorMessage(error, 'error-step-approve')
    return resp
  }
}

async function submit(activeKey: string, submitFn: () => Promise<string>, provider: Provider) {
  let resp = { activeKey, hash: '', error: '' }
  try {
    resp.hash = await submitFn()
    await helpers.waitForTransaction(resp.hash, provider)
    return resp
  } catch (error) {
    console.error(error)
    resp.error = getErrorMessage(error, 'error-api')
    return resp
  }
}

function _getPriceImpactResp(priceImpactResp: PromiseSettledResult<string | undefined>, slippage: string) {
  let resp = { priceImpact: fulfilledValue(priceImpactResp) ?? 'N/A', isHighPriceImpact: false }

  if (resp.priceImpact === 'N/A') return resp

  if (+resp.priceImpact > 0 && +slippage > 0) {
    resp.isHighPriceImpact = +resp.priceImpact > +slippage
  }
  return resp
}

function _detailInfoRespErrorMessage(
  futureRatesResp: PromiseSettledResult<{ borrowApr: string; lendApr: string; borrowApy: string; lendApy: string }>,
  bandsResp: PromiseSettledResult<[number, number]>,
) {
  let errorMessage = ''

  if (futureRatesResp.status === 'rejected') {
    errorMessage = futureRatesResp.reason.message
  } else if (bandsResp.status === 'rejected') {
    errorMessage = bandsResp.reason.message
  }

  return errorMessage
}
