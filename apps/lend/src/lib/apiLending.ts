import type { LiqRange } from '@/store/types'
import type { StepStatus } from '@/ui/Stepper/types'

import PromisePool from '@supercharge/promise-pool'
import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'

import { INVALID_ADDRESS } from '@/constants'
import { fulfilledValue, getErrorMessage, log } from '@/utils/helpers'
import { BN, shortenAccount } from '@/ui/utils'
import networks from '@/networks'

export const helpers = {
  initApi: async (chainId: ChainId, wallet: Wallet | null) => {
    try {
      const { networkId, rpcUrl } = networks[chainId]
      const api = cloneDeep((await import('@curvefi/lending-api')).default) as Api

      if (wallet) {
        await api.init('Web3', { network: networkId, externalProvider: _getWalletProvider(wallet) }, { chainId })
        return api
      } else if (rpcUrl) {
        await api.init('JsonRpc', { url: rpcUrl }, { chainId })
        return api
      }
    } catch (error) {
      console.error(error)
    }
  },
  getImageBaseUrl: (chainId: ChainId) => {
    return networks[chainId ?? '1'].imageBaseUrl
  },
  getIsUserCloseToLiquidation: (
    userFirstBand: number,
    userLiquidationBand: number | null,
    oraclePriceBand: number | null | undefined
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
  fetchMarkets: async (api: Api) => {
    const resp = { marketList: [] as string[], error: '' }
    try {
      log('fetchMarkets', api.chainId)
      await api.oneWayfactory.fetchMarkets()
      resp.marketList = api.oneWayfactory.getMarketList()
      return resp
    } catch (error) {
      resp.error = 'error-api'
      console.error(error)
      return resp
    }
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
  fetchUsdRate: async (api: Api, tokenAddress: string) => {
    let resp: { usdRate: string | number; error: string } = { usdRate: 0, error: '' }
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
  getStepStatus: (isComplete: boolean, isInProgress: boolean, isValid: boolean): StepStatus => {
    return isComplete ? 'succeeded' : isInProgress ? 'in-progress' : isValid ? 'current' : 'pending'
  },
  getUserActiveKey: (api: Api | null, owmData: OWMDataCacheOrApi) => {
    const { signerAddress } = api ?? {}
    const { owm } = owmData ?? {}
    if (!api || !signerAddress || !owm) return ''
    return `${owm.id}-${shortenAccount(signerAddress)}`
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

const market = {
  hasLeverage: async ({ owm }: OWMData) => {
    return owm.leverage.hasLeverage()
  },
  fetchStatsParameters: async (owmDatas: OWMData[]) => {
    log('fetchStatsParameters', owmDatas.length)
    let results: { [id: string]: MarketStatParameters } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { parameters: null, error }
      })
      .process(async ({ owm }) => {
        const parameters = await owm.stats.parameters()
        results[owm.id] = { parameters, error: '' }
      })

    return results
  },
  fetchStatsBands: async (owmDatas: OWMData[]) => {
    log('fetchStatsBands', owmDatas.length)
    let results: { [id: string]: MarketStatBands } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { bands: null, error }
      })
      .process(async (owmData) => {
        const { owm } = owmData
        const [balances, bandsInfo, bandsBalances] = await Promise.all([
          owm.stats.balances(),
          owm.stats.bandsInfo(),
          owm.stats.bandsBalances(),
        ])

        const { activeBand, minBand, maxBand, liquidationBand } = bandsInfo
        const maxMinBands = [maxBand, minBand]

        const bandBalances = liquidationBand ? await owm.stats.bandBalances(liquidationBand) : null
        const parsedBandsBalances = await _fetchChartBandBalancesData(
          _sortBands(bandsBalances),
          liquidationBand,
          owmData,
          true
        )

        results[owm.id] = {
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
  fetchStatsAmmBalances: async (owmDatas: OWMData[]) => {
    log('fetchStatsAmmBalances', owmDatas.length)
    let results: { [id: string]: MarketStatAmmBalances } = {}
    const useMultiCall = owmDatas.length > 1

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { borrowed: '', collateral: '', error }
      })
      .process(async ({ owm }) => {
        const resp = await owm.stats.ammBalances(useMultiCall)
        results[owm.id] = { ...resp, error: '' }
      })

    return results
  },
  fetchStatsCapAndAvailable: async (owmDatas: OWMData[]) => {
    log('fetchStatsCapAndAvailable', owmDatas.length)
    let results: { [id: string]: MarketStatCapAndAvailable } = {}
    const useMultiCall = owmDatas.length > 1

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { cap: '', available: '', error }
      })
      .process(async ({ owm }) => {
        const resp = await owm.stats.capAndAvailable(useMultiCall)
        results[owm.id] = { ...resp, error: '' }
      })

    return results
  },
  fetchStatsTotals: async (owmDatas: OWMData[]) => {
    log('fetchStatsTotals', owmDatas.length)
    let results: { [id: string]: MarketStatTotals } = {}
    const useMultiCall = owmDatas.length > 1

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { totalDebt: '', error }
      })
      .process(async ({ owm }) => {
        const totalDebt = await owm.stats.totalDebt(useMultiCall)
        results[owm.id] = { totalDebt, error: '' }
      })

    return results
  },
  fetchMarketsPrices: async (owmDatas: OWMData[]) => {
    log('fetchMarketsPrices', owmDatas.length)
    let results: { [id: string]: MarketPrices } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { prices: null, error }
      })
      .process(async ({ owm }) => {
        const [oraclePrice, oraclePriceBand, price, basePrice] = await Promise.all([
          owm.oraclePrice(),
          owm.oraclePriceBand(),
          owm.price(),
          owm.basePrice(),
        ])

        results[owm.id] = {
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
  fetchMarketsRates: async (owmDatas: OWMData[]) => {
    log('fetchMarketsRates', owmDatas.length)
    const useMultiCall = owmDatas.length > 1
    let results: { [id: string]: MarketRates } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { rates: null, error }
      })
      .process(async ({ owm }) => {
        const rates = await owm.stats.rates(useMultiCall)
        results[owm.id] = { rates, error: '' }
      })

    return results
  },
  fetchMarketsVaultsTotalLiquidity: async (owmDatas: OWMData[]) => {
    log('fetchMarketsVaultsTotalLiquidity', owmDatas.length)
    let results: { [id: string]: MarketTotalLiquidity } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { liquidity: '', error }
      })
      .process(async ({ owm }) => {
        const totalLiquidity = await owm.vault.totalLiquidity()
        results[owm.id] = { totalLiquidity: liquidity, error: '' }
      })

    return results
  },
  fetchMarketsVaultsRewards: async (owmDatas: OWMData[]) => {
    const useMultiCall = owmDatas.length > 1
    log('fetchMarketsVaultsRewards', owmDatas.length)
    let results: { [id: string]: MarketRewards } = {}

    await PromisePool.for(owmDatas).process(async ({ owm }) => {
      let resp: MarketRewards = {
        rewards: {
          other: [],
          crv: [0, 0],
        },
        error: '',
      }

      // check if gauge is valid
      if (owm.addresses.gauge === INVALID_ADDRESS) {
        return resp
      } else {
        const isRewardsOnly = owm.vault.rewardsOnly()

        let rewards: { other: RewardOther[]; crv: RewardCrv[] } = {
          other: [],
          crv: [0, 0],
        }

        // isRewardsOnly = both CRV and other comes from same endpoint.
        if (isRewardsOnly) {
          const rewardsResp = await owm.vault.rewardsApr(useMultiCall)
          rewards.other = _filterZeroApy(rewardsResp)
        } else {
          const [others, crv] = await Promise.all([owm.vault.rewardsApr(useMultiCall), owm.vault.crvApr(useMultiCall)])
          rewards.other = _filterZeroApy(others)
          rewards.crv = crv
        }
        // rewards typescript say APY, but it is actually APR
        resp.rewards = rewards
        results[owm.id] = resp
      }
    })

    return results
  },
  fetchMarketsMaxLeverage: async (owmDatas: OWMData[]) => {
    log('fetchMarketsMaxLeverage', owmDatas.length)
    let results: { [id: string]: MarketMaxLeverage } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { maxLeverage: '', error }
      })
      .process(async (owmData) => {
        const { hasLeverage, owm } = owmData
        const maxLeverage = hasLeverage ? await owm.leverage.maxLeverage(owm?.minBands) : ''
        results[owm.id] = { maxLeverage, error: '' }
      })

    return results
  },
  fetchMarketsTotalCollateralValue: async (api: Api, owmDatas: OWMData[]) => {
    log('fetchMarketsTotalCollateralValue', owmDatas.length)
    let results: MarketsTotalCollateralValueMapper = {}
    const useMultiCall = owmDatas.length > 1

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { total: null, tooltipContent: [], error }
      })
      .process(async (owmData) => {
        const { owm } = owmData
        const { collateral_token, borrowed_token } = owm

        const [ammBalance, collateralUsdRate, borrowedUsdRate] = await Promise.all([
          owm.stats.ammBalances(useMultiCall),
          api.getUsdRate(collateral_token.address),
          api.getUsdRate(borrowed_token.address),
        ])

        if (collateralUsdRate.toString() === 'NaN' || borrowedUsdRate.toString() === 'NaN') {
          results[owm.id] = { total: null, tooltipContent: [], error: 'Unable to get usd rate' }
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

        results[owm.id] = { total, tooltipContent, error: '' }
      })

    return results
  },
}

const user = {
  fetchLoansExists: async (api: Api, owmDatas: OWMData[]) => {
    log('fetchUserLoansExists', api.chainId, owmDatas.length)
    let results: { [userActiveKey: string]: { owmId: string; loanExists: boolean; error: string } } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, owmData) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        results[userActiveKey] = { owmId: owmData.owm.id, loanExists: false, error }
      })
      .process(async (owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        const loanExists = await owmData.owm.userLoanExists()
        results[userActiveKey] = { owmId: owmData.owm.id, loanExists, error: '' }
      })

    return results
  },
  fetchLoansDetailsHealth: async (api: Api, owmDatas: OWMData[]) => {
    log('fetchUsersLoansDetailsHealth', api.chainId, owmDatas.length)
    let results: { [userActiveKey: string]: UserLoanHealth } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, owmData) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        results[userActiveKey] = { healthFull: '', healthNotFull: '', error }
      })
      .process(async (owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        const { owm } = owmData
        const [healthFull, healthNotFull] = await Promise.all([owm.userHealth(), owm.userHealth(false)])

        results[userActiveKey] = { healthFull, healthNotFull, error: '' }
      })

    return results
  },
  fetchLoansDetailsState: async (api: Api, owmDatas: OWMData[]) => {
    log('fetchUsersLoansDetailsState', api.chainId, owmDatas.length)
    let results: { [userActiveKey: string]: UserLoanState } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, owmData) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        results[userActiveKey] = { collateral: '', borrowed: '', debt: '', N: '', error }
      })
      .process(async (owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        const { owm } = owmData
        const state = await owm.userState()
        results[userActiveKey] = { ...state, error: '' }
      })

    return results
  },
  fetchLoansDetails: async (api: Api, owmDatas: OWMData[]) => {
    log('fetchUsersLoansDetails', api.chainId, owmDatas.length)
    let results: { [userActiveKey: string]: UserLoanDetails } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, owmData) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        results[userActiveKey] = {
          details: null,
          error,
        }
      })
      .process(async (owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        const { owm } = owmData
        const [state, healthFull, healthNotFull, range, bands, prices, bandsBalances, oraclePriceBand, loss] =
          await Promise.all([
            owm.userState(),
            owm.userHealth(),
            owm.userHealth(false),
            owm.userRange(),
            owm.userBands(),
            owm.userPrices(),
            owm.userBandsBalances(),
            owm.oraclePriceBand(),
            owm.userLoss(),
          ])

        const resp = await owm.stats.bandsInfo()
        const { liquidationBand } = resp ?? {}

        const reversedUserBands = _reverseBands(bands)
        const isCloseToLiquidation = helpers.getIsUserCloseToLiquidation(
          reversedUserBands[0],
          liquidationBand,
          oraclePriceBand
        )
        const parsedBandsBalances = await _fetchChartBandBalancesData(
          _sortBands(bandsBalances),
          liquidationBand,
          owmData,
          false
        )

        results[userActiveKey] = {
          details: {
            state,
            health: isCloseToLiquidation ? healthNotFull : healthFull,
            healthFull,
            healthNotFull,
            bands: reversedUserBands,
            bandsBalances: parsedBandsBalances,
            bandsPct: range ? await owm.calcRangePct(range) : '0',
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
  fetchMarketBalances: async (api: Api, owmDatas: OWMData[]) => {
    log('fetchUsersMarketBalances', api.chainId, owmDatas.length)
    let results: { [userActiveKey: string]: UserMarketBalances } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, owmData) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        results[userActiveKey] = {
          collateral: '',
          borrowed: '',
          vaultShares: '',
          vaultSharesConverted: '',
          gauge: '',
          error,
        }
      })
      .process(async (owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        const resp = await owmData.owm.wallet.balances()
        let vaultSharesConverted =
          +resp.vaultShares > 0 ? await owmData.owm.vault.convertToAssets(resp.vaultShares) : '0'
        results[userActiveKey] = { ...resp, vaultSharesConverted, error: '' }
      })

    return results
  },
}

const loanCreate = {
  maxLeverage: async ({ owm }: OWMData, n: number) => {
    log('maxLeverage', n)
    let resp = { n, maxLeverage: '', error: '' }

    try {
      resp.maxLeverage = await owm.leverage.maxLeverage(n)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-api')
      return resp
    }
  },
  maxRecv: async (
    activeKey: string,
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    n: number,
    isLeverage: boolean
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'maxRecvLeverage' : 'maxRecv', userBorrowed, userCollateral, n)
    let resp = { activeKey, maxRecv: '', error: '' }

    try {
      if (isLeverage) {
        const maxRecvLeverageResp = await owm.leverage.createLoanMaxRecv(userCollateral, userBorrowed, n)
        resp.maxRecv = maxRecvLeverageResp.maxDebt
      } else {
        resp.maxRecv = await owm.createLoanMaxRecv(userCollateral, n)
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  detailInfo: async (activeKey: string, { owm }: OWMData, userCollateral: string, debt: string, n: number) => {
    userCollateral = userCollateral || '0'
    debt = debt || '0'
    log('detailInfo', userCollateral, debt, n, 'futureRates', [0, debt])
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }
    try {
      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp] = await Promise.allSettled([
        owm.createLoanHealth(userCollateral, debt, n, undefined),
        owm.createLoanHealth(userCollateral, debt, n, false),
        owm.stats.futureRates(0, debt),
        owm.createLoanBands(userCollateral, debt, n),
        owm.createLoanPrices(userCollateral, debt, n),
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
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    n: number,
    maxSlippage: string
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log('detailInfoLeverage', userCollateral, userBorrowed, debt, n, maxSlippage, 'futureRates', [0, debt])
    let resp: {
      activeKey: string
      resp: (DetailInfoLeverageResp & { expectedCollateral: ExpectedCollateral | null; routes: Routes | null }) | null
      error: string
    } = { activeKey, resp: null, error: '' }

    try {
      const [expectedCollateralResp] = await Promise.allSettled([
        owm.leverage.createLoanExpectedCollateral(userCollateral, userBorrowed, debt, +maxSlippage),
      ])

      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp, routesResp, priceImpactResp] =
        await Promise.allSettled([
          owm.leverage.createLoanHealth(userCollateral, userBorrowed, debt, n),
          owm.leverage.createLoanHealth(userCollateral, userBorrowed, debt, n, false),
          owm.stats.futureRates(0, debt),
          owm.leverage.createLoanBands(userCollateral, userBorrowed, debt, n),
          owm.leverage.createLoanPrices(userCollateral, userBorrowed, debt, n),
          owm.leverage.createLoanRoute(userBorrowed, debt),
          owm.leverage.createLoanPriceImpact(userCollateral, userBorrowed, debt),
        ])

      const bands = fulfilledValue(bandsResp) ?? [0, 0]

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp) ?? null,
        bands: _reverseBands(bands),
        prices: fulfilledValue(pricesResp) ?? [],
        routes: fulfilledValue(routesResp) ?? null,
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
    { owm }: OWMData,
    totalCollateral: string | undefined,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    isLeverage: boolean
  ) => {
    totalCollateral = totalCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'LiqRangesLeverage' : 'liqRanges', totalCollateral, userCollateral, userBorrowed, debt)

    const { minBands, maxBands } = owm
    const bands = Array.from({ length: +maxBands - +minBands + 1 }, (_, i) => i + minBands)
    let liqRangesList: LiqRange[] = []
    let liqRangesListMapper: { [n: string]: LiqRange & { sliderIdx: number } } = {}
    let sliderIdx = 0

    if (isLeverage) {
      const [maxRecvsResults, loanBandsResults, loanPricesResults] = await Promise.allSettled([
        owm.leverage.createLoanMaxRecvAllRanges(userCollateral, userBorrowed),
        owm.leverage.createLoanBandsAllRanges(userCollateral, userBorrowed, debt),
        owm.leverage.createLoanPricesAllRanges(userCollateral, userBorrowed, debt),
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
        owm.createLoanMaxRecvAllRanges(userCollateral),
        owm.createLoanBandsAllRanges(userCollateral, debt),
        owm.createLoanPricesAllRanges(userCollateral, debt),
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
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    n: number,
    maxSlippage: string,
    isLeverage: boolean
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'estGasApprovalLeverage' : 'estGasApproval', userCollateral, userBorrowed, debt, n, maxSlippage)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = isLeverage
        ? await owm.leverage.createLoanIsApproved(userCollateral, userBorrowed)
        : await owm.createLoanIsApproved(userCollateral)
      resp.estimatedGas = resp.isApproved
        ? isLeverage
          ? await owm.leverage.estimateGas.createLoan(userCollateral, userBorrowed, debt, n, +maxSlippage)
          : await owm.estimateGas.createLoan(userCollateral, debt, n)
        : isLeverage
        ? await owm.leverage.estimateGas.createLoanApprove(userCollateral, userBorrowed)
        : await owm.estimateGas.createLoanApprove(userCollateral)
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
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    isLeverage: boolean
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'approveLeverage' : 'approve', userCollateral, userBorrowed)
    const fn = async () =>
      isLeverage
        ? await owm.leverage.createLoanApprove(userCollateral, userBorrowed)
        : await owm.createLoanApprove(userCollateral)
    return await approve(activeKey, fn, provider)
  },
  create: async (
    activeKey: string,
    provider: Provider,
    owmData: OWMData,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    n: number,
    maxSlippage: string,
    isLeverage: boolean
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'createLeverage' : 'create', userCollateral, userBorrowed, debt, n, maxSlippage)
    const fn = async () =>
      isLeverage
        ? await owmData.owm.leverage.createLoan(userCollateral, userBorrowed, debt, n, +maxSlippage)
        : await owmData.owm.createLoan(userCollateral, debt, n)
    return await submit(activeKey, fn, provider)
  },
}

const loanBorrowMore = {
  maxRecv: async ({ owm }: OWMData, activeKey: string, userCollateral: string) => {
    userCollateral = userCollateral || '0'
    log('maxRecv', userCollateral)
    let resp = { activeKey, maxRecv: '', error: '' }

    try {
      const maxRecv = await owm.borrowMoreMaxRecv(userCollateral)
      resp.maxRecv = +maxRecv < 0 ? '0' : maxRecv
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  maxRecvLeverage: async ({ owm }: OWMData, activeKey: string, userCollateral: string, userBorrowed: string) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log('maxRecvLeverage', userCollateral, userBorrowed)

    let resp: { activeKey: string; maxRecv: MaxRecvLeverageResp | null; error: string } = {
      activeKey,
      maxRecv: null,
      error: '',
    }

    try {
      resp.maxRecv = await owm.leverage.borrowMoreMaxRecv(userCollateral, userBorrowed)
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
    { owm }: OWMData,
    userCollateral: string,
    debt: string
  ) => {
    userCollateral = userCollateral || '0'
    debt = debt || '0'
    log('loanBorrowMoreHealthsBandsPrices', userCollateral, debt, 'futureRates', [0, debt])
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }

    try {
      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp] = await Promise.allSettled([
        signerAddress ? owm.borrowMoreHealth(userCollateral, debt, true) : '',
        signerAddress ? owm.borrowMoreHealth(userCollateral, debt, false) : '',
        owm.stats.futureRates(0, debt),
        owm.borrowMoreBands(userCollateral, debt),
        owm.borrowMorePrices(userCollateral, debt),
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
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    slippage: string
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
            routes: Routes | null
          })
        | null
      error: string
    } = { activeKey, resp: null, error: '' }

    try {
      // expected need to be called before the other functions
      const [expectedCollateralResp] = await Promise.allSettled([
        owm.leverage.borrowMoreExpectedCollateral(userCollateral, userBorrowed, debt, +slippage),
      ])

      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp, routesResp, priceImpactResp] =
        await Promise.allSettled([
          signerAddress ? owm.leverage.borrowMoreHealth(userCollateral, userBorrowed, debt, true) : '',
          signerAddress ? owm.leverage.borrowMoreHealth(userCollateral, userBorrowed, debt, false) : '',
          owm.stats.futureRates(0, debt),
          owm.leverage.borrowMoreBands(userCollateral, userBorrowed, debt),
          owm.leverage.borrowMorePrices(userCollateral, userBorrowed, debt),
          owm.leverage.borrowMoreRoute(userBorrowed, debt),
          owm.leverage.borrowMorePriceImpact(userCollateral, userBorrowed, debt),
        ])

      const bands = fulfilledValue(bandsResp) ?? []

      resp.resp = {
        healthFull: fulfilledValue(healthFullResp) ?? '',
        healthNotFull: fulfilledValue(healthNotFullResp) ?? '',
        futureRates: fulfilledValue(futureRatesResp) ?? null,
        prices: fulfilledValue(pricesResp) ?? [],
        bands: _reverseBands(bands),
        expectedCollateral: fulfilledValue(expectedCollateralResp) ?? null,
        routes: fulfilledValue(routesResp) ?? null,
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
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    maxSlippage: string,
    isLeverage: boolean
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'estGasApprovalLeverage' : 'estGasApproval', userCollateral, userBorrowed, debt, maxSlippage)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = isLeverage
        ? await owm.leverage.borrowMoreIsApproved(userCollateral, userBorrowed)
        : await owm.borrowMoreIsApproved(userCollateral)
      resp.estimatedGas = resp.isApproved
        ? isLeverage
          ? await owm.leverage.estimateGas.borrowMore(userCollateral, userBorrowed, debt, +maxSlippage)
          : await owm.estimateGas.borrowMore(userCollateral, debt)
        : isLeverage
        ? await owm.leverage.estimateGas.borrowMoreApprove(userCollateral, userBorrowed)
        : await owm.estimateGas.borrowMoreApprove(userCollateral)
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
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    isLeverage: boolean
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'approveLeverage' : 'approve', userCollateral, userBorrowed)
    const fn = async () =>
      isLeverage
        ? await owm.leverage.borrowMoreApprove(userCollateral, userBorrowed)
        : await owm.borrowMoreApprove(userCollateral)
    return await approve(activeKey, fn, provider)
  },
  borrowMore: async (
    activeKey: string,
    provider: Provider,
    { owm }: OWMData,
    userCollateral: string,
    userBorrowed: string,
    debt: string,
    maxSlippage: string,
    isLeverage: boolean
  ) => {
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    debt = debt || '0'
    log(isLeverage ? 'borrowMoreLeverage' : 'borrowMore', userCollateral, userBorrowed, debt, maxSlippage)
    const fn = async () =>
      isLeverage
        ? await owm.leverage.borrowMore(userCollateral, userBorrowed, debt, +maxSlippage)
        : await owm.borrowMore(userCollateral, debt)
    return await submit(activeKey, fn, provider)
  },
}

const loanRepay = {
  repayIsAvailableLeverage: async (
    { owm }: OWMData,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log('repayIsAvailableLeverage', stateCollateral, userCollateral, userBorrowed)
    let resp: { repayIsAvailable: boolean | null; error: string } = { repayIsAvailable: null, error: '' }

    try {
      resp.repayIsAvailable = await owm.leverage.repayIsAvailable(stateCollateral, userCollateral, userBorrowed)
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
    { owm }: OWMData,
    userBorrowed: string,
    isFullRepay: boolean,
    userStateDebt: string
  ) => {
    log('detailInfo', userBorrowed)
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }

    try {
      const [healthFullResp, healthNotFullResp, futureRatesResp, bandsResp, pricesResp] = await Promise.allSettled([
        signerAddress && !isFullRepay ? owm.repayHealth(userBorrowed, true) : '',
        signerAddress && !isFullRepay ? owm.repayHealth(userBorrowed, false) : '',
        owm.stats.futureRates(0, `-${isFullRepay ? userStateDebt : userBorrowed}`),
        isFullRepay ? ([0, 0] as [number, number]) : owm.repayBands(userBorrowed),
        isFullRepay ? ['', ''] : owm.repayPrices(userBorrowed),
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
    { owm }: OWMData,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    maxSlippage: string,
    userStateDebt: string
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
            routes: Routes | null
          })
        | null
      error: string
    } = { activeKey, resp: null, error: '' }

    try {
      const [expectedBorrowedResp] = await Promise.allSettled([
        owm.leverage.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed, +maxSlippage),
      ])

      const expectedBorrowed = fulfilledValue(expectedBorrowedResp) ?? null

      const [repayIsFullResp] = await Promise.allSettled([
        owm.leverage.repayIsFull(stateCollateral, userCollateral, userBorrowed),
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
        signerAddress ? owm.leverage.repayHealth(stateCollateral, userCollateral, userBorrowed, true) : '',
        signerAddress ? owm.leverage.repayHealth(stateCollateral, userCollateral, userBorrowed, false) : '',
        owm.stats.futureRates(0, `-${repayIsFull ? userStateDebt : expectedBorrowed?.totalBorrowed}`),
        repayIsFull
          ? ([0, 0] as [number, number])
          : owm.leverage.repayBands(stateCollateral, userCollateral, userBorrowed),
        repayIsFull ? ['', ''] : owm.leverage.repayPrices(stateCollateral, userCollateral, userBorrowed),
        owm.leverage.repayRoute(stateCollateral, userCollateral),
        owm.leverage.repayPriceImpact(stateCollateral, userCollateral, userBorrowed),
        owm.leverage.repayIsAvailable(stateCollateral, userCollateral, userBorrowed),
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
        routes: fulfilledValue(routesResp) ?? null,
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
    { owm }: OWMData,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    isFullRepay: boolean,
    maxSlippage: string,
    isLeverage: boolean
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
      maxSlippage
    )
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = isLeverage
        ? await owm.leverage.repayIsApproved(userCollateral, userBorrowed)
        : isFullRepay
        ? await owm.fullRepayIsApproved()
        : await owm.repayIsApproved(userBorrowed)
      resp.estimatedGas = isLeverage
        ? resp.isApproved
          ? await owm.leverage.estimateGas.repay(stateCollateral, userCollateral, userBorrowed, +maxSlippage)
          : await owm.leverage.estimateGas.repayApprove(userCollateral, userBorrowed)
        : resp.isApproved
        ? isFullRepay
          ? await owm.estimateGas.fullRepay()
          : await owm.estimateGas.repay(userBorrowed)
        : isFullRepay
        ? await owm.estimateGas.fullRepayApprove()
        : await owm.estimateGas.repayApprove(userBorrowed)
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
    { owm }: OWMData,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    isFullRepay: boolean,
    isLeverage: boolean
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'approveLeverage' : 'approve', stateCollateral, userCollateral, userBorrowed, isFullRepay)
    const fn = async () =>
      isLeverage
        ? await owm.leverage.repayApprove(userCollateral, userBorrowed)
        : isFullRepay
        ? await owm.fullRepayApprove()
        : await owm.repayApprove(userBorrowed)
    return await approve(activeKey, fn, provider)
  },
  repay: async (
    activeKey: string,
    provider: Provider,
    { owm }: OWMData,
    stateCollateral: string,
    userCollateral: string,
    userBorrowed: string,
    isFullRepay: boolean,
    maxSlippage: string,
    isLeverage: boolean
  ) => {
    stateCollateral = stateCollateral || '0'
    userCollateral = userCollateral || '0'
    userBorrowed = userBorrowed || '0'
    log(isLeverage ? 'repayLeverage' : 'repay', stateCollateral, userCollateral, userBorrowed, isFullRepay, maxSlippage)
    const fn = async () =>
      isLeverage
        ? await owm.leverage.repay(stateCollateral, userCollateral, userBorrowed, +maxSlippage)
        : isFullRepay
        ? await owm.fullRepay()
        : await owm.repay(userBorrowed)
    return await submit(activeKey, fn, provider)
  },
}

const loanSelfLiquidation = {
  detailInfo: async (api: Api, owmData: OWMData, slippage: string) => {
    const { owm } = owmData
    log('detailInfo', slippage)
    const resp: { tokensToLiquidate: string; futureRates: FutureRates | null; error: string } = {
      tokensToLiquidate: '',
      futureRates: null,
      error: '',
    }

    try {
      resp.tokensToLiquidate = await owm.tokensToLiquidate()
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-api')
    }

    if (!resp.error && +resp.tokensToLiquidate > 0) {
      try {
        resp.futureRates = await owm.stats.futureRates(0, `-${resp.tokensToLiquidate}`)
      } catch (error) {
        console.error(error)
        resp.error = getErrorMessage(error, 'error-api')
      }
    }
    return resp
  },
  estGasApproval: async ({ owm }: OWMData, maxSlippage: string) => {
    log('loanSelfLiquidationEstGasApproval', owm.collateral_token.symbol, maxSlippage)
    let resp = { isApproved: false, estimatedGas: null as EstimatedGas, error: '', warning: '' }

    try {
      resp.isApproved = await owm.selfLiquidateIsApproved()
      resp.estimatedGas = resp.isApproved
        ? await owm.estimateGas.selfLiquidate(+maxSlippage)
        : await owm.estimateGas.selfLiquidateApprove()
      return resp
    } catch (err) {
      console.error(err)
      resp.error = getErrorMessage(err, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (provider: Provider, { owm }: OWMData) => {
    log('approve')
    const fn = async () => await owm.selfLiquidateApprove()
    return await approve('', fn, provider)
  },
  selfLiquidate: async (provider: Provider, { owm }: OWMData, slippage: string) => {
    log('selfLiquidate', slippage)
    const fn = async () => await owm.selfLiquidate(+slippage)
    return await submit('', fn, provider)
  },
}

const loanCollateralAdd = {
  detailInfo: async (
    activeKey: string,
    { signerAddress }: Api,
    { owm }: OWMData,
    collateral: string,
    address?: string
  ) => {
    log('detailInfo', collateral)
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }
    try {
      const [healthFull, healthNotFull, bands, prices] = await Promise.all([
        signerAddress ? owm.addCollateralHealth(collateral, true, address) : '',
        signerAddress ? owm.addCollateralHealth(collateral, false, address) : '',
        owm.addCollateralBands(collateral),
        owm.addCollateralPrices(collateral),
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
  estGasApproval: async (activeKey: string, { owm }: OWMData, collateral: string) => {
    log('estGasApproval', collateral)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await owm.addCollateralIsApproved(collateral)
      resp.estimatedGas = resp.isApproved
        ? await owm.estimateGas.addCollateral(collateral)
        : await owm.estimateGas.addCollateralApprove(collateral)
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
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, userCollateral: string) => {
    log('approve', userCollateral)
    const fn = async () => await owm.addCollateralApprove(userCollateral)
    return await approve(activeKey, fn, provider)
  },
  addCollateral: async (activeKey: string, provider: Provider, { owm }: OWMData, userCollateral: string) => {
    log('addCollateral', userCollateral)
    const fn = async () => await owm.addCollateral(userCollateral)
    return await submit(activeKey, fn, provider)
  },
}

const loanCollateralRemove = {
  maxRemovable: async ({ owm }: OWMData) => {
    log('loanCollateralRemoveMax', owm.collateral_token.symbol)
    let resp = { maxRemovable: '', error: '' }

    try {
      const maxRemovable = await owm.maxRemovable()
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
    { owm }: OWMData,
    collateral: string,
    address?: string
  ) => {
    log('loanCollateralRemoveHealthPricesBands', owm.collateral_token.symbol, collateral)
    let resp: { activeKey: string; resp: DetailInfoResp | null; error: string } = { activeKey, resp: null, error: '' }
    try {
      const [healthFull, healthNotFull, bands, prices] = await Promise.all([
        signerAddress ? owm.removeCollateralHealth(collateral, true, address) : '',
        signerAddress ? owm.removeCollateralHealth(collateral, false, address) : '',
        owm.removeCollateralBands(collateral),
        owm.removeCollateralPrices(collateral),
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
  estGas: async (activeKey: string, { owm }: OWMData, collateral: string) => {
    log('loanCollateralRemoveEstGas', owm.collateral_token.symbol, collateral)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await owm.removeCollateralEstimateGas(collateral)
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
  removeCollateral: async (activeKey: string, provider: Provider, { owm }: OWMData, userCollateral: string) => {
    log('removeCollateral', userCollateral)
    const fn = async () => await owm.removeCollateral(userCollateral)
    return await submit(activeKey, fn, provider)
  },
}

// VAULT
const vaultDeposit = {
  max: async ({ owm }: OWMData) => {
    log('vaultDepositMax', owm.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await owm.vault.maxDeposit()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultDepositPreview', owm.id, amount, 'futureRates', [amount, 0])
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      const [preview, futureRates] = await Promise.all([
        owm.vault.previewDeposit(amount),
        owm.stats.futureRates(amount, 0),
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
  estGasApproval: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultDepositEstGas', owm.id, amount)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await owm.vault.depositIsApproved(amount)
      resp.estimatedGas = resp.isApproved
        ? await owm.vault.estimateGas.deposit(amount)
        : await owm.vault.estimateGas.depositApprove(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultDepositApprove', owm.id, amount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await owm.vault.depositApprove(amount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  deposit: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultDeposit', owm.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await owm.vault.deposit(amount)
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
  max: async ({ owm }: OWMData) => {
    log('vaultMintMax', owm.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await owm.vault.maxMint()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultMintPreview', owm.id, amount, 'futureRates', [amount, 0])
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      const [preview, futureRates] = await Promise.all([
        owm.vault.previewMint(amount),
        owm.stats.futureRates(amount, 0),
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
  estGasApproval: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultMintEstGasApproval', owm.id, amount)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await owm.vault.mintIsApproved(amount)
      resp.estimatedGas = resp.isApproved
        ? await owm.vault.estimateGas.mint(amount)
        : await owm.vault.estimateGas.mintApprove(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultMintApprove', owm.id, amount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await owm.vault.mintApprove(amount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  mint: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultMint', owm.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await owm.vault.mint(amount)
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
  estGasApproval: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultStakeEstGasApproval', owm.id, amount)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await owm.vault.stakeIsApproved(amount)
      resp.estimatedGas = resp.isApproved
        ? await owm.vault.estimateGas.stake(amount)
        : await owm.vault.estimateGas.stakeApprove(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultStakeApprove', owm.id, amount)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await owm.vault.stakeApprove(amount)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  stake: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultStake', owm.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await owm.vault.stake(amount)
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
  max: async ({ owm }: OWMData) => {
    log('vaultWithdrawMax', owm.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await owm.vault.maxWithdraw()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultWithdrawPreviewFutureRates', owm.id, amount, 'futureRates', [`-${amount}`, 0])
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      const [preview, futureRates] = await Promise.all([
        owm.vault.previewWithdraw(amount),
        owm.stats.futureRates(`-${amount}`, 0),
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
  estGas: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultWithdrawEstGas', owm.id, amount)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await owm.vault.estimateGas.withdraw(amount)
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
    { owm }: OWMData,
    isFullWithdraw: boolean,
    amount: string,
    vaultShares: string
  ) => {
    log('vaultWithdraw', owm.id, amount, 'isFullWithdraw', isFullWithdraw, 'vaultShares', vaultShares)

    const resp = { activeKey, hash: '', error: '' }
    try {
      // if isFUllWithdraw which means max === vaultSharesConverted, use redeem(walletBalances.vaultShares)
      // else use withdraw(amount)
      resp.hash = isFullWithdraw ? await owm.vault.redeem(vaultShares) : await owm.vault.withdraw(amount)
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
  max: async ({ owm }: OWMData) => {
    log('vaultRedeemMax', owm.id)
    let resp = { max: '', error: '' }

    try {
      resp.max = await owm.vault.maxRedeem()
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  detailInfo: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultRedeemPreview', owm.id, amount)
    let resp: { activeKey: string; preview: string; futureRates: FutureRates | null; error: string } = {
      activeKey,
      preview: '',
      futureRates: null,
      error: '',
    }

    try {
      resp.preview = await owm.vault.previewRedeem(amount)
      log('vaultRedeemFutureRates', [`-${resp.preview}`, 0])
      resp.futureRates = await owm.stats.futureRates(`-${resp.preview}`, 0)
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  estGas: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultRedeemEstGas', owm.id, amount)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await owm.vault.estimateGas.redeem(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  redeem: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultRedeem', owm.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await owm.vault.redeem(amount)
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
  estGas: async (activeKey: string, { owm }: OWMData, amount: string) => {
    log('vaultUnstakeEstGas', owm.id, amount)
    let resp = { activeKey, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.estimatedGas = await owm.vault.estimateGas.unstake(amount)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  unstake: async (activeKey: string, provider: Provider, { owm }: OWMData, amount: string) => {
    log('vaultUnstake', owm.id, amount)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await owm.vault.unstake(amount)
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
  claimable: async (userActiveKey: string, { owm }: OWMData) => {
    log('vaultClaimable', owm.id)
    let resp = {
      userActiveKey,
      claimable: { crv: '', rewards: [] as { token: string; symbol: string; amount: string }[] },
      error: '',
    }

    try {
      const [crv, rewards] = await Promise.all([owm.vault.claimableCrv(), owm.vault.claimableRewards()])
      resp.claimable.crv = crv
      resp.claimable.rewards = rewards
      return resp
    } catch (error) {
      resp.error = getErrorMessage(error, 'error-api')
      console.error(error)
      return resp
    }
  },
  claimCrv: async (userActiveKey: string, provider: Provider, { owm }: OWMData) => {
    log('vaultClaim', owm.id)
    const resp = { userActiveKey, hash: '', error: '' }
    try {
      resp.hash = await owm.vault.claimCrv()
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-claim')
      return resp
    }
  },
  claimRewards: async (userActiveKey: string, provider: Provider, { owm }: OWMData) => {
    log('vaultClaim', owm.id)
    const resp = { userActiveKey, hash: '', error: '' }
    try {
      resp.hash = await owm.vault.claimRewards()
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
  { owm }: OWMData,
  isMarket: boolean
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
    const [p_up, p_down] = await owm.calcBandPrices(+n)
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
  bandsResp: PromiseSettledResult<[number, number]>
) {
  let errorMessage = ''

  if (futureRatesResp.status === 'rejected') {
    errorMessage = futureRatesResp.reason.message
  } else if (bandsResp.status === 'rejected') {
    errorMessage = bandsResp.reason.message
  }

  return errorMessage
}
