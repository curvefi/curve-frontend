import type { LiqRange } from '@/store/types'
import type { StepStatus } from '@/ui/Stepper/types'

import PromisePool from '@supercharge/promise-pool'

import { INVALID_ADDRESS } from '@/constants'
import { fulfilledValue, getErrorMessage, log, sleep } from '@/utils/helpers'
import networks from '@/networks'
import cloneDeep from 'lodash/cloneDeep'
import { BN, shortenAccount } from '@/ui/utils'
import sortBy from 'lodash/sortBy'

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
    activeBand: number | null | undefined
  ) => {
    if (typeof userLiquidationBand !== null && activeBand === null) {
      return false
    } else if (typeof activeBand !== 'undefined' && activeBand !== null) {
      return userFirstBand <= activeBand + 2
    }
    return false
  },
  isTooMuch: (val1: string | number | undefined, val2: string | number | undefined) => {
    const isNotUndefined = typeof val1 !== 'undefined' && typeof val2 !== 'undefined'
    const isNotEmpty = val1 !== '' && val2 !== ''
    if (isNotUndefined && isNotEmpty && Number(val1) >= 0 && Number(val2) >= 0) {
      return Number(val1) > Number(val2)
    } else {
      return false
    }
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
  fetchStatsParameters: async (owmDatas: OWMData[]) => {
    log('fetchStatsParameters', owmDatas.length)
    let results: { [id: string]: MarketStatParameters } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
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

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { borrowed: '', collateral: '', error }
      })
      .process(async ({ owm }) => {
        const resp = await owm.stats.ammBalances()
        results[owm.id] = { ...resp, error: '' }
      })

    return results
  },
  fetchStatsCapAndAvailable: async (owmDatas: OWMData[]) => {
    log('fetchStatsCapAndAvailable', owmDatas.length)
    let results: { [id: string]: MarketStatCapAndAvailable } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { cap: '', available: '', error }
      })
      .process(async ({ owm }) => {
        const resp = await owm.stats.capAndAvailable()
        results[owm.id] = { ...resp, error: '' }
      })

    return results
  },
  fetchStatsTotals: async (owmDatas: OWMData[]) => {
    log('fetchStatsTotals', owmDatas.length)
    let results: { [id: string]: MarketStatTotals } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { totalDebt: '', error }
      })
      .process(async ({ owm }) => {
        const totalDebt = await owm.stats.totalDebt()
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
    let results: { [id: string]: MarketRates } = {}

    await PromisePool.for(owmDatas)
      .handleError((errorObj, { owm }) => {
        console.error(errorObj)
        const error = getErrorMessage(errorObj, 'error-api')
        results[owm.id] = { rates: null, error }
      })
      .process(async ({ owm }) => {
        const rates = await owm.stats.rates()
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
        results[owm.id] = { totalLiquidity: '', error }
      })
      .process(async ({ owm }) => {
        const totalLiquidity = await owm.vault.totalLiquidity()
        results[owm.id] = { totalLiquidity, error: '' }
      })

    return results
  },
  fetchMarketsVaultsRewards: async (owmDatas: OWMData[]) => {
    log('fetchMarketsVaultsRewards', owmDatas.length)
    let results: { [id: string]: MarketRewards } = {}

    const handleResponse = async (owm: OWM) => {
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

        // rewards.other = [
        //   {
        //     gaugeAddress: '0xdb190e4d9c9a95fdf066b258892b8d6bb107434e',
        //     tokenAddress: '0xedb67ee1b171c4ec66e6c10ec43edbba20fae8e9',
        //     symbol: 'rKP3R',
        //     apy: 34.591404117158504,
        //   },
        //   {
        //     gaugeAddress: '0xdb190e4d9c9a95fdf066b258892b8d6bb1012345',
        //     tokenAddress: '0xedb67ee1b171c4ec66e6c10ec43edbba20fa6484',
        //     symbol: 'CRV',
        //     apy: 0.14228653926122917,
        //   },
        // ]
        // rewards.crv = [0.0008219651894421486, 0.0020549129736053716]

        // isRewardsOnly = both CRV and other comes from same endpoint.
        if (isRewardsOnly) {
          const rewardsResp = await owm.vault.rewardsApr()
          rewards.other = _filterZeroApy(rewardsResp)
        } else {
          const [others, crv] = await Promise.all([owm.vault.rewardsApr(), owm.vault.crvApr()])
          rewards.other = _filterZeroApy(others)
          rewards.crv = crv
        }
        // rewards typescript say APY, but it is actually APR
        resp.rewards = rewards
        results[owm.id] = resp
      }
    }

    const { errors } = await PromisePool.for(owmDatas).process(async ({ owm }) => {
      return await handleResponse(owm)
    })

    // retries errors
    if (errors.length) {
      await sleep(1000)
      await PromisePool.for(owmDatas)
        .handleError((errorObj, { owm }) => {
          console.error('retry error', errorObj)
          const error = getErrorMessage(errorObj, 'error-api')
          results[owm.id] = { rewards: null, error }
        })
        .process(async ({ owm }) => {
          return await handleResponse(owm)
        })
    }

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
        const [state, healthFull, healthNotFull, range, bands, prices, bandsBalances] = await Promise.all([
          owm.userState(),
          owm.userHealth(),
          owm.userHealth(false),
          owm.userRange(),
          owm.userBands(),
          owm.userPrices(),
          owm.userBandsBalances(),
          // owm.userLoss(),
        ])

        const resp = await owm.stats.bandsInfo()
        const { activeBand, liquidationBand } = resp ?? {}

        const reversedUserBands = _reverseBands(bands)
        const isCloseToLiquidation = helpers.getIsUserCloseToLiquidation(
          reversedUserBands[0],
          liquidationBand,
          activeBand
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
            // loss: _parseUserLoss(loss),
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
  maxRecv: async (activeKey: string, { owm }: OWMData, collateral: string, n: number) => {
    const parsedCollateral = !collateral ? '0' : collateral
    log('loanCreateMaxRecv', owm.collateral_token.symbol, parsedCollateral, n)
    let resp = { activeKey, maxRecv: '', error: '' }

    try {
      resp.maxRecv = await owm.createLoanMaxRecv(parsedCollateral, n)
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
    collateral: string,
    debt: string,
    n: number
  ) => {
    log('loanCreateDetailInfo', owm.collateral_token.symbol, collateral, debt, n)
    let resp: DetailInfoResp = { activeKey, resp: null, error: '' }
    try {
      const [healthFull, healthNotFull, futureRates, bands, prices] = await Promise.all([
        signerAddress ? owm.createLoanHealth(collateral, debt, n, undefined) : '',
        signerAddress ? owm.createLoanHealth(collateral, debt, n, false) : '',
        owm.stats.futureRates(0, debt),
        owm.createLoanBands(collateral, debt, n),
        owm.createLoanPrices(collateral, debt, n),
      ])

      resp.resp = {
        healthFull,
        healthNotFull,
        futureRates,
        prices,
        bands: _reverseBands(bands),
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  liqRanges: async (activeKey: string, { owm }: OWMData, collateral: string, debt: string) => {
    log('loanCreateLiqRanges', owm.id, collateral, debt)

    const { minBands, maxBands } = owm
    const bands = Array.from({ length: +maxBands - +minBands + 1 }, (_, i) => i + minBands)
    let liqRangesList: LiqRange[] = []
    let liqRangesListMapper: { [n: string]: LiqRange & { sliderIdx: number } } = {}
    let sliderIdx = 0

    const [maxRecvsResults, loanBandsResults, loanPricesResults] = await Promise.allSettled([
      owm.createLoanMaxRecvAllRanges(collateral),
      owm.createLoanBandsAllRanges(collateral, debt),
      owm.createLoanPricesAllRanges(collateral, debt),
    ])

    const maxRecvs = fulfilledValue(maxRecvsResults) ?? null
    const loanPrices = fulfilledValue(loanPricesResults) ?? null
    const loanBands = fulfilledValue(loanBandsResults) ?? null

    for (const n of bands) {
      const bands = loanBands?.[n]
      const maxRecv = maxRecvs?.[n]
      const nLoanPrices = loanPrices?.[n]

      const detail: LiqRange = {
        n: Number(n),
        collateral,
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

    return {
      activeKey,
      liqRanges: liqRangesList,
      liqRangesMapper: liqRangesListMapper,
    }
  },
  estGasApproval: async (
    activeKey: string,
    { owm }: OWMData,
    collateral: string,
    debt: string,
    n: number,
    maxSlippage: string
  ) => {
    log('loanCreateEstGasApproval', owm.collateral_token.symbol, collateral, debt, n, maxSlippage)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await owm.createLoanIsApproved(collateral)
      resp.estimatedGas = resp.isApproved
        ? await owm.estimateGas.createLoan(collateral, debt, n)
        : await owm.estimateGas.createLoanApprove(collateral)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, collateral: string) => {
    log('loanCreateApprove', owm.collateral_token.symbol, collateral)
    let resp = { activeKey, hashes: [] as string[], error: '' }
    try {
      resp.hashes = await owm.createLoanApprove(collateral)
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
    owmData: OWMData,
    collateral: string,
    debt: string,
    n: number,
    maxSlippage: string
  ) => {
    log('loanCreate', owmData.displayName, collateral, debt, n, maxSlippage)
    const resp = { activeKey, hash: '', error: '' }
    try {
      resp.hash = await owmData.owm.createLoan(collateral, debt, n)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-create')
      return resp
    }
  },
}

const loanBorrowMore = {
  maxRecv: async ({ owm }: OWMData, collateral: string) => {
    const parsedCollateral = !collateral ? '0' : collateral
    log('loanBorrowMoreMaxRecv', owm.collateral_token.symbol, parsedCollateral)
    let resp = { maxRecv: '', error: '' }

    try {
      const maxRecv = await owm.borrowMoreMaxRecv(parsedCollateral)
      resp.maxRecv = +maxRecv < 0 ? '0' : maxRecv
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-max-amount')
      return resp
    }
  },
  detailInfo: async (activeKey: string, { signerAddress }: Api, { owm }: OWMData, collateral: string, debt: string) => {
    const parsedCollateral = !collateral ? '0' : collateral
    log('loanBorrowMoreHealthsBandsPrices', parsedCollateral, debt, 'futureRates', [0, debt])
    let resp: DetailInfoResp = { activeKey, resp: null, error: '' }

    try {
      const [healthFull, healthNotFull, futureRates, bands, prices] = await Promise.all([
        signerAddress ? owm.borrowMoreHealth(parsedCollateral, debt, true) : '',
        signerAddress ? owm.borrowMoreHealth(parsedCollateral, debt, false) : '',
        owm.stats.futureRates(0, debt),
        owm.borrowMoreBands(parsedCollateral, debt),
        owm.borrowMorePrices(parsedCollateral, debt),
      ])

      resp.resp = {
        healthFull,
        healthNotFull,
        futureRates,
        prices,
        bands: _reverseBands(bands),
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  estGasApproval: async (activeKey: string, { owm }: OWMData, collateral: string, debt: string) => {
    const parsedCollateral = collateral || '0'
    const parsedDebt = debt || '0'
    log('loanBorrowMoreEstGasApproval', activeKey, owm.collateral_token.symbol, parsedCollateral, parsedDebt)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = await owm.borrowMoreIsApproved(parsedCollateral)
      resp.estimatedGas = resp.isApproved
        ? await owm.estimateGas.borrowMore(parsedCollateral, parsedDebt)
        : await owm.estimateGas.borrowMoreApprove(parsedCollateral)
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
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, collateral: string) => {
    const parsedCollateral = collateral || '0'
    log('loanBorrowMoreApprove', owm.collateral_token.symbol, parsedCollateral)
    let resp = { activeKey, hashes: [] as string[], error: '' }

    try {
      resp.hashes = await owm.borrowMoreApprove(parsedCollateral)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  borrowMore: async (activeKey: string, provider: Provider, { owm }: OWMData, collateral: string, debt: string) => {
    const parsedCollateral = collateral || '0'
    const parsedDebt = debt || '0'
    log('loanBorrowMore', owm.collateral_token.symbol, parsedCollateral, parsedDebt)
    let resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await owm.borrowMore(parsedCollateral, parsedDebt)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-borrow-more')
      return resp
    }
  },
}

const loanRepay = {
  detailInfo: async (activeKey: string, { signerAddress }: Api, { owm }: OWMData, debt: string) => {
    log('loanRepayHealthsBandsPrices', owm.collateral_token.symbol, debt)
    let resp: DetailInfoResp = { activeKey, resp: null, error: '' }

    try {
      const [healthFull, healthNotFull, futureRates, bands, prices] = await Promise.all([
        signerAddress ? owm.repayHealth(debt, true) : '',
        signerAddress ? owm.repayHealth(debt, false) : '',
        owm.stats.futureRates(0, `-${debt}`),
        owm.repayBands(debt),
        owm.repayPrices(debt),
      ])

      resp.resp = {
        healthFull,
        healthNotFull,
        futureRates,
        prices,
        bands: _reverseBands(bands),
      }
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-details')
      return resp
    }
  },
  estGasApproval: async (activeKey: string, { owm }: OWMData, debt: string, isFullRepay: boolean) => {
    log('loanRepayEstGasApproval', owm.collateral_token.symbol, isFullRepay, debt)
    let resp = { activeKey, isApproved: false, estimatedGas: null as EstimatedGas, error: '' }

    try {
      resp.isApproved = isFullRepay ? await owm.fullRepayIsApproved() : await owm.repayIsApproved(debt)
      resp.estimatedGas = resp.isApproved
        ? isFullRepay
          ? await owm.estimateGas.fullRepay()
          : await owm.estimateGas.repay(debt)
        : isFullRepay
        ? await owm.estimateGas.fullRepayApprove()
        : await owm.estimateGas.repayApprove(debt)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-est-gas-approval')
      return resp
    }
  },
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, debt: string, isFullRepay: boolean) => {
    log('loanRepayApprove', owm.collateral_token.symbol, isFullRepay, debt)
    let resp = { activeKey, hashes: [] as string[], error: '' }

    try {
      resp.hashes = isFullRepay ? await owm.fullRepayApprove() : await owm.repayApprove(debt)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  repay: async (activeKey: string, provider: Provider, { owm }: OWMData, debt: string, isFullRepay: boolean) => {
    log('loanRepay', owm.collateral_token.symbol, isFullRepay, debt)
    let resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = isFullRepay ? await owm.fullRepay() : await owm.repay(debt)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-repay')
      return resp
    }
  },
}

const loanSelfLiquidation = {
  detailInfo: async (api: Api, owmData: OWMData, slippage: string) => {
    const { owm } = owmData
    log('loanSelfLiquidationTokensToLiquidate', owm.id)
    const resp: {
      tokensToLiquidate: string
      warning: 'warning-not-in-liquidation-mode' | ''
      futureRates: FutureRates | null
      error: string
    } = {
      tokensToLiquidate: '',
      futureRates: null,
      warning: '',
      error: '',
    }

    try {
      resp.tokensToLiquidate = await owm.tokensToLiquidate()
      await owm.estimateGas.selfLiquidate(+slippage)
    } catch (error) {
      if (error?.message && error.message.includes('not in liquidation mode')) {
        resp.warning = 'warning-not-in-liquidation-mode'
      }
    }

    if (!resp.warning && +resp.tokensToLiquidate > 0) {
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
      const haveErrorMessage = err?.message
      if (haveErrorMessage && err.message.includes('not in liquidation mode')) {
        resp.warning = 'warning-not-in-liquidation-mode'
      } else {
        resp.error = getErrorMessage(err, 'error-est-gas-approval')
      }
      return resp
    }
  },
  approve: async (provider: Provider, owmData: OWMData) => {
    const { owm } = owmData
    log('loanSelfLiquidationApprove', owm.collateral_token.symbol)
    let resp = { hashes: [] as string[], error: '' }
    try {
      resp.hashes = await owm.selfLiquidateApprove()
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  selfLiquidate: async (provider: Provider, { owm }: OWMData, slippage: string) => {
    log('loanSelfLiquidation', owm.collateral_token.symbol, slippage)
    let resp = { hash: '', error: '' }
    try {
      resp.hash = await owm.selfLiquidate(+slippage)
      await helpers.waitForTransaction(resp.hash, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-liquidate')
      return resp
    }
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
    log('loanCollateralAddHealthPricesBands', owm.collateral_token.symbol, collateral)
    let resp: DetailInfoResp = { activeKey, resp: null, error: '' }
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
    log('loanCollateralAddEstGasApproval', owm.collateral_token.symbol, collateral)
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
  approve: async (activeKey: string, provider: Provider, { owm }: OWMData, collateral: string) => {
    log('loanCollateralAddApprove', owm.collateral_token.symbol, collateral)
    let resp = { activeKey, hashes: [] as string[], error: '' }

    try {
      resp.hashes = await owm.addCollateralApprove(collateral)
      await helpers.waitForTransactions(resp.hashes, provider)
      return resp
    } catch (error) {
      console.error(error)
      resp.error = getErrorMessage(error, 'error-step-approve')
      return resp
    }
  },
  addCollateral: async (activeKey: string, provider: Provider, { owm }: OWMData, collateral: string) => {
    log('loanCollateralAdd', owm.collateral_token.symbol, collateral)
    let resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await owm.addCollateral(collateral)
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
    let resp: DetailInfoResp = { activeKey, resp: null, error: '' }
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
  removeCollateral: async (activeKey: string, provider: Provider, { owm }: OWMData, collateral: string) => {
    log('loanCollateralRemove', owm.collateral_token.symbol, collateral)
    let resp = { activeKey, hash: '', error: '' }

    try {
      resp.hash = await owm.removeCollateral(collateral)
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

function _parseUserLoss(userLoss: UserLoss) {
  const smallAmount = 0.00000001
  let resp = cloneDeep(userLoss)
  resp.loss = resp.loss && BN(resp.loss).isLessThan(smallAmount) ? '0' : userLoss.loss
  resp.loss_pct = resp.loss_pct && BN(resp.loss_pct).isLessThan(smallAmount) ? '0' : userLoss.loss_pct

  return resp
}

// TODO: refactor shared between pool and lend
function _filterZeroApy(others: RewardOther[]) {
  return Array.isArray(others) ? others.filter(({ apy }) => +apy > 0) : ([] as RewardOther[])
}
