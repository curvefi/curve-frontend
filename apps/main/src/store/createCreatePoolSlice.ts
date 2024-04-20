import {
  CreateToken,
  TokenState,
  ImplementationId,
  SwapType,
  TokenId,
  NgAssetType,
} from '@/components/PageCreatePool/types'
import type { ContractTransactionResponse } from 'ethers'

import type { GetState, SetState } from 'zustand'
import produce from 'immer'
import { BigNumber } from 'bignumber.js'
import { t } from '@lingui/macro'

import type { State } from '@/store/useStore'
import networks from '@/networks'

import {
  POOL_PRESETS,
  CRYPTOSWAP,
  STABLESWAP,
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
} from '@/components/PageCreatePool/constants'
import { isTricrypto } from '@/components/PageCreatePool/utils'

type SliceState = {
  navigationIndex: number
  swapType: SwapType
  advanced: boolean
  poolPresetIndex: number
  tokensInPool: {
    tokenAmount: number
    metaPoolToken: boolean
    [TOKEN_A]: TokenState
    [TOKEN_B]: TokenState
    [TOKEN_C]: TokenState
    [TOKEN_D]: TokenState
    [TOKEN_E]: TokenState
    [TOKEN_F]: TokenState
    [TOKEN_G]: TokenState
    [TOKEN_H]: TokenState
  }
  userAddedTokens: CreateToken[]
  initialPrice: {
    [TOKEN_A]: number
    [TOKEN_B]: number
    [TOKEN_C]: number
    [TOKEN_D]: number
    [TOKEN_E]: number
    [TOKEN_F]: number
    [TOKEN_G]: number
    [TOKEN_H]: number
    initialPrice: string[]
  }
  parameters: {
    stableSwapFee: string
    midFee: string
    outFee: string
    stableA: string
    cryptoA: string
    gamma: string
    allowedExtraProfit: string
    feeGamma: string
    adjustmentStep: string
    maHalfTime: string
    maExpTime: string
    offpegFeeMultiplier: string
  }
  poolName: string
  poolSymbol: string
  assetType: string
  implementation: ImplementationId
  validation: {
    poolType: boolean
    tokensInPool: boolean
    parameters: boolean
    poolInfo: boolean
  }
  transactionState: {
    txStatus: 'LOADING' | 'CONFIRMING' | 'ERROR' | 'SUCCESS' | ''
    txSuccess: boolean
    transaction: ContractTransactionResponse | null
    txLink: string
    fetchPoolStatus: 'LOADING' | 'ERROR' | 'SUCCESS' | ''
    poolAddress: string
    poolId: string
    lpTokenAddress: string
    errorMessage: string | null
  }
}

export type CreatePoolSlice = {
  createPool: SliceState & {
    setNavigationIndex: (index: number) => void
    updateSwapType: (swaptype: string, chainId: ChainId) => void
    updateAdvanced: (boolean: boolean) => void
    updatePoolPresetIndex: (presetIndex: number) => void
    resetPoolPresetIndex: () => void
    updateTokenAmount: (amount: number) => void
    updateTokensInPool: (
      curve: CurveApi,
      tokenA: TokenState,
      tokenB: TokenState,
      tokenC: TokenState,
      tokenD: TokenState,
      tokenE: TokenState,
      tokenF: TokenState,
      tokenG: TokenState,
      tokenH: TokenState
    ) => void
    clearToken: (tokenId: TokenId) => void
    updateStandardToggle: (tokenId: TokenId) => void
    updateNgAssetType: (tokenId: TokenId, value: NgAssetType) => void
    updateOracleAddress: (tokenId: TokenId, oracleAddress: string) => void
    updateOracleFunction: (tokenId: TokenId, oracleFunction: string) => void
    updateUserAddedTokens: (address: string, symbol: string, haveSameTokenName: boolean, basePool: boolean) => void
    updateInitialPrice: (priceA: number, priceB: number, priceC?: number) => void
    updateTokenPrice: (tokenId: TokenId, price: number) => void
    refreshInitialPrice: (curve: CurveApi) => void
    updateStableSwapFee: (fee: string) => void
    updateMidFee: (fee: string) => void
    updateOutFee: (fee: string) => void
    updateStableA: (value: string | number) => void
    updateCryptoA: (value: string | number) => void
    updateGamma: (value: string | number) => void
    updateAllowedExtraProfit: (value: string | number) => void
    updateFeeGamma: (value: string | number) => void
    updateAdjustmentStep: (value: string | number) => void
    updateMaHalfTime: (value: string | number) => void
    updateMaExpTime: (value: string | number) => void
    updateOffpegFeeMultiplier: (value: string | number) => void
    updatePoolName: (name: string) => void
    updatePoolSymbol: (symbol: string) => void
    updateAssetType: (type: string) => void
    updateImplementation: (type: ImplementationId) => void
    updatePoolTypeValidation: (poolType: boolean) => void
    updateTokensInPoolValidation: (tokensInPool: boolean) => void
    updateParametersValidation: (parameters: boolean) => void
    updatePoolInfoValidation: (poolInfo: boolean) => void
    deployPool: (curve: CurveApi) => void
    resetState: () => void
  }
}

export const DEFAULT_CREATE_POOL_STATE = {
  navigationIndex: 0,
  advanced: false,
  swapType: '',
  poolPresetIndex: null,
  tokensInPool: {
    tokenAmount: 2,
    metaPoolToken: false,
    [TOKEN_A]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    [TOKEN_B]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    [TOKEN_C]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    [TOKEN_D]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    [TOKEN_E]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    [TOKEN_F]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    [TOKEN_G]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    [TOKEN_H]: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
  },
  implementation: 0,
  initialPrice: {
    [TOKEN_A]: 0,
    [TOKEN_B]: 0,
    [TOKEN_C]: 0,
    [TOKEN_D]: 0,
    [TOKEN_E]: 0,
    [TOKEN_F]: 0,
    [TOKEN_G]: 0,
    [TOKEN_H]: 0,
    initialPrice: ['0', '0'],
  },
  parameters: {
    stableSwapFee: '',
    midFee: '',
    outFee: '',
    stableA: '',
    cryptoA: '',
    gamma: '',
    allowedExtraProfit: '',
    feeGamma: '',
    adjustmentStep: '',
    maHalfTime: '',
    maExpTime: '',
    offpegFeeMultiplier: '',
  },
  poolName: '',
  poolSymbol: '',
  assetType: null,
  userAddedTokens: [],
  validation: {
    poolType: false,
    tokensInPool: false,
    parameters: false,
    poolInfo: false,
  },
  transactionState: {
    txStatus: '',
    txSuccess: false,
    transaction: null,
    txLink: '',
    fetchPoolState: '',
    poolAddress: '',
    poolId: '',
    lpTokenAddress: '',
    errorMessage: null,
  },
}

const calculateInitialPrice = (tokenA: number, tokenB: number) => {
  const initialPrice = new BigNumber(tokenB).div(new BigNumber(tokenA)).toNumber()

  // convert to 4 meaningful numbers
  if (initialPrice >= 1000) return initialPrice.toFixed(0).toString()
  if (initialPrice >= 100) return initialPrice.toFixed(1).toString()
  if (initialPrice >= 10) return initialPrice.toFixed(2).toString()
  if (initialPrice >= 1) return initialPrice.toFixed(3).toString()
  return initialPrice.toPrecision(4).toString()
}

const createCreatePoolSlice = (set: SetState<State>, get: GetState<State>) => ({
  createPool: {
    ...DEFAULT_CREATE_POOL_STATE,
    setNavigationIndex: (index: number) => {
      set(
        produce((state) => {
          state.createPool.navigationIndex = index
        })
      )
    },
    updateAdvanced: (boolean: boolean) => {
      set(
        produce((state) => {
          state.createPool.advanced = boolean
        })
      )
    },
    updateSwapType: (swapType: SwapType, chainId: ChainId) => {
      // set allowed token amount
      if (swapType === CRYPTOSWAP) {
        const amount = networks[chainId].twocryptoFactory || networks[chainId].twocryptoFactory ? 2 : 3

        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenAmount = amount
          })
        )
      }

      // clean up if multiple basepools were selected when changing from CRYPTOSWAP
      if (swapType === STABLESWAP) {
        const { tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH } = get().createPool.tokensInPool

        if (tokenA.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool.tokenAmount = 2
              state.createPool.tokensInPool[TOKEN_B] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_B]
            })
          )
        }
        if (tokenB.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_B] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_B]
              state.createPool.tokensInPool.metaPoolToken = false
            })
          )
        }
        if (tokenC.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_C] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_C]
            })
          )
        }
        if (tokenD.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_D] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_D]
            })
          )
        }
        if (tokenE.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_E] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_E]
            })
          )
        }
        if (tokenF.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_F] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_F]
            })
          )
        }
        if (tokenG.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_G] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_G]
            })
          )
        }
        if (tokenH.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_H] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_H]
            })
          )
        }
      }

      set(
        produce((state) => {
          state.createPool.parameters = DEFAULT_CREATE_POOL_STATE.parameters
          state.createPool.poolPresetIndex = null
          state.createPool.swapType = swapType
        })
      )
    },
    updatePoolPresetIndex: (presetIndex: number) => {
      set(
        produce((state) => {
          state.createPool.poolPresetIndex = presetIndex
          state.createPool.parameters = POOL_PRESETS[presetIndex].defaultParams
        })
      )
    },
    resetPoolPresetIndex: () => {
      set(
        produce((state) => {
          state.createPool.parameters = DEFAULT_CREATE_POOL_STATE.parameters
          state.createPool.poolPresetIndex = null
        })
      )
    },
    updateTokensInPool: async (
      curve: CurveApi,
      tokenA: TokenState,
      tokenB: TokenState,
      tokenC: TokenState,
      tokenD: TokenState,
      tokenE: TokenState,
      tokenF: TokenState,
      tokenG: TokenState,
      tokenH: TokenState
    ) => {
      let tokensInPoolUpdates = {
        ...get().createPool.tokensInPool,
        tokenA,
        tokenB,
        tokenC,
        tokenD,
        tokenE,
        tokenF,
        tokenG,
        tokenH,
      }

      tokensInPoolUpdates.tokenAmount =
        (tokenA.basePool || tokenB.basePool) && get().createPool.swapType === STABLESWAP
          ? 2
          : get().createPool.tokensInPool.tokenAmount

      tokensInPoolUpdates.metaPoolToken = tokenA.basePool || tokenB.basePool
      tokensInPoolUpdates.tokenA = {
        ...tokenA,
        basePool: tokenA.basePool,
        ngAssetType: tokenA.basePool ? 0 : get().createPool.tokensInPool[TOKEN_A].ngAssetType,
      }
      tokensInPoolUpdates.tokenB = {
        ...tokenB,
        basePool: tokenB.basePool,
        ngAssetType: tokenB.basePool ? 0 : get().createPool.tokensInPool[TOKEN_B].ngAssetType,
      }

      let initialPriceUpdates = {
        ...get().createPool.initialPrice,
      }

      // set token prices
      if (tokenA.address !== '') {
        const tokenAPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenA.address)
        initialPriceUpdates.tokenA = Number(tokenAPriceRaw)
      }
      if (tokenB.address !== '') {
        const tokenBPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenB.address)
        initialPriceUpdates.tokenB = Number(tokenBPriceRaw)
      }
      if (tokenC.address !== '') {
        const tokenCPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenC.address)
        initialPriceUpdates.tokenC = Number(tokenCPriceRaw)
      }
      if (tokenD.address !== '') {
        const tokenDPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenD.address)
        initialPriceUpdates.tokenD = Number(tokenDPriceRaw)
      }
      if (tokenE.address !== '') {
        const tokenEPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenE.address)
        initialPriceUpdates.tokenE = Number(tokenEPriceRaw)
      }
      if (tokenF.address !== '') {
        const tokenFPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenF.address)
        initialPriceUpdates.tokenF = Number(tokenFPriceRaw)
      }
      if (tokenG.address !== '') {
        const tokenGPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenG.address)
        initialPriceUpdates.tokenG = Number(tokenGPriceRaw)
      }
      if (tokenH.address !== '') {
        const tokenHPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenH.address)
        initialPriceUpdates.tokenH = Number(tokenHPriceRaw)
      }

      initialPriceUpdates.initialPrice = [
        calculateInitialPrice(initialPriceUpdates.tokenA, initialPriceUpdates.tokenB),
        calculateInitialPrice(initialPriceUpdates.tokenA, initialPriceUpdates.tokenC),
      ]

      set(
        produce((state) => {
          state.createPool.tokensInPool = tokensInPoolUpdates
          state.createPool.initialPrice = initialPriceUpdates
        })
      )
    },
    clearToken: (tokenId: TokenId) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId] = DEFAULT_CREATE_POOL_STATE.tokensInPool[tokenId]
        })
      )
    },
    updateNgAssetType: (tokenId: TokenId, value: NgAssetType) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].ngAssetType = value
        })
      )
    },
    updateOracleAddress: (tokenId: TokenId, oracleAddress: string) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].oracleAddress = oracleAddress
        })
      )
    },
    updateOracleFunction: (tokenId: TokenId, oracleFunction: string) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].oracleFunction = oracleFunction
        })
      )
    },
    updateTokenAmount: (amount: number) =>
      set(
        produce((state) => {
          state.createPool.tokensInPool.tokenAmount = amount
        })
      ),
    updateUserAddedTokens: (address: string, symbol: string, haveSameTokenName: boolean, basePool: boolean) => {
      set(
        produce((state) => {
          state.createPool.userAddedTokens.push({
            address: address.toLowerCase(),
            symbol: symbol,
            haveSameTokenName: haveSameTokenName,
            userAddedToken: true,
            basePool: basePool,
          })
        })
      )
    },
    updateInitialPrice: (tokenA: number, tokenB: number, tokenC: number) =>
      set(
        produce((state) => {
          state.createPool.initialPrice.initialPrice = [
            calculateInitialPrice(tokenA, tokenB),
            calculateInitialPrice(tokenA, tokenC),
          ]
        })
      ),
    updateTokenPrice: (tokenId: TokenId, price: number) => {
      if (tokenId === TOKEN_A) {
        get().createPool.updateInitialPrice(
          price,
          get().createPool.initialPrice[TOKEN_B],
          get().createPool.initialPrice[TOKEN_C]
        )

        set(
          produce((state) => {
            state.createPool.initialPrice[TOKEN_A] = price
          })
        )
      }
      if (tokenId === TOKEN_B) {
        get().createPool.updateInitialPrice(
          get().createPool.initialPrice[TOKEN_A],
          price,
          get().createPool.initialPrice[TOKEN_C]
        )

        set(
          produce((state) => {
            state.createPool.initialPrice[TOKEN_B] = price
          })
        )
      }
      if (tokenId === TOKEN_C) {
        get().createPool.updateInitialPrice(
          get().createPool.initialPrice[TOKEN_A],
          get().createPool.initialPrice[TOKEN_B],
          price
        )

        set(
          produce((state) => {
            state.createPool.initialPrice[TOKEN_C] = price
          })
        )
      }
      console.log(get().createPool.initialPrice)
    },
    refreshInitialPrice: async (curve: CurveApi) => {
      const tokenAPriceRaw = await get().usdRates.fetchUsdRateByToken(
        curve,
        get().createPool.tokensInPool[TOKEN_A].address
      )
      const tokenBPriceRaw = await get().usdRates.fetchUsdRateByToken(
        curve,
        get().createPool.tokensInPool[TOKEN_B].address
      )
      const tokenCPriceRaw = await get().usdRates.fetchUsdRateByToken(
        curve,
        get().createPool.tokensInPool[TOKEN_C].address
      )
      const tokenAPrice = Number(tokenAPriceRaw)
      const tokenBPrice = Number(tokenBPriceRaw)
      const tokenCPrice = Number(tokenCPriceRaw)

      get().createPool.updateInitialPrice(tokenAPrice, tokenBPrice, tokenCPrice)

      set(
        produce((state) => {
          state.createPool.initialPrice = {
            ...get().createPool.initialPrice,
            tokenAPrice: tokenAPrice,
            tokenBPrice: tokenBPrice,
            tokenCPrice: tokenCPrice,
          }
        })
      )
    },
    updateStableSwapFee: (fee: string) =>
      set(
        produce((state) => {
          state.createPool.parameters.stableSwapFee = fee
        })
      ),
    updateMidFee: (fee: string) =>
      set(
        produce((state) => {
          state.createPool.parameters.midFee = fee
        })
      ),
    updateOutFee: (fee: string) =>
      set(
        produce((state) => {
          state.createPool.parameters.outFee = fee
        })
      ),
    updateStableA: (value: number) =>
      set(
        produce((state) => {
          state.createPool.parameters.stableA = new BigNumber(value).toString()
        })
      ),
    updateCryptoA: (value: number) =>
      set(
        produce((state) => {
          state.createPool.parameters.cryptoA = new BigNumber(value).toString()
        })
      ),
    updateGamma: (value: number | string) =>
      set(
        produce((state) => {
          value === typeof 'string'
            ? (state.createPool.parameters.gamma = value)
            : (state.createPool.parameters.gamma = new BigNumber(value).toString())
        })
      ),
    updateAllowedExtraProfit: (value: number | string) =>
      set(
        produce((state) => {
          value === typeof 'string'
            ? (state.createPool.parameters.allowedExtraProfit = value)
            : (state.createPool.parameters.allowedExtraProfit = new BigNumber(value).toString())
        })
      ),
    updateFeeGamma: (value: number | string) =>
      set(
        produce((state) => {
          value === typeof 'string'
            ? (state.createPool.parameters.feeGamma = value)
            : (state.createPool.parameters.feeGamma = new BigNumber(value).toString())
        })
      ),
    updateAdjustmentStep: (value: number | string) =>
      set(
        produce((state) => {
          value === typeof 'string'
            ? (state.createPool.parameters.adjustmentStep = value)
            : (state.createPool.parameters.adjustmentStep = new BigNumber(value).toString())
        })
      ),
    updateMaHalfTime: (value: number | string) =>
      set(
        produce((state) => {
          value === typeof 'string'
            ? (state.createPool.parameters.maHalfTime = value)
            : (state.createPool.parameters.maHalfTime = new BigNumber(value).toString())
        })
      ),
    updateMaExpTime: (value: number | string) =>
      set(
        produce((state) => {
          value === typeof 'string'
            ? (state.createPool.parameters.maExpTime = value)
            : (state.createPool.parameters.maExpTime = new BigNumber(value).toString())
        })
      ),
    updateOffpegFeeMultiplier: (value: number | string) =>
      set(
        produce((state) => {
          value === typeof 'string'
            ? (state.createPool.parameters.offpegFeeMultiplier = value)
            : (state.createPool.parameters.offpegFeeMultiplier = new BigNumber(value).toString())
        })
      ),
    updatePoolName: (name: string) =>
      set(
        produce((state) => {
          state.createPool.poolName = name
        })
      ),
    updatePoolSymbol: (symbol: string) =>
      set(
        produce((state) => {
          state.createPool.poolSymbol = symbol
        })
      ),
    updateAssetType: (type: string) =>
      set(
        produce((state) => {
          state.createPool.assetType = type
        })
      ),
    updateImplementation: (type: ImplementationId) =>
      set(
        produce((state) => {
          state.createPool.implementation = type
        })
      ),
    updatePoolTypeValidation: (poolType: boolean) => {
      set(
        produce((state) => {
          state.createPool.validation.poolType = poolType
        })
      )
    },
    updateTokensInPoolValidation: (tokensInPool: boolean) => {
      set(
        produce((state) => {
          state.createPool.validation.tokensInPool = tokensInPool
        })
      )
    },
    updateParametersValidation: (parameters: boolean) => {
      set(
        produce((state) => {
          state.createPool.validation.parameters = parameters
        })
      )
    },
    updatePoolInfoValidation: (poolInfo: boolean) => {
      set(
        produce((state) => {
          state.createPool.validation.poolInfo = poolInfo
        })
      )
    },
    deployPool: async (curve: CurveApi) => {
      const chainId = curve.chainId
      const {
        poolSymbol,
        swapType,
        tokensInPool: { tokenAmount, metaPoolToken, tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH },
        parameters: {
          stableSwapFee,
          stableA,
          cryptoA,
          midFee,
          outFee,
          gamma,
          feeGamma,
          allowedExtraProfit,
          adjustmentStep,
          maExpTime,
          maHalfTime,
          offpegFeeMultiplier,
        },
        poolName,
        assetType,
        initialPrice,
        implementation,
      } = get().createPool
      const fetchNewPool = get().pools.fetchNewPool
      const fetchGasInfo = get().gas.fetchGasInfo
      const notifyNotification = get().wallet.notifyNotification

      let dismissNotificationHandler

      const notifyPendingMessage = t`Please confirm to create pool ${poolName}.`
      const { dismiss: dismissConfirm } = notifyNotification(notifyPendingMessage, 'pending')

      dismissNotificationHandler = dismissConfirm

      await fetchGasInfo(curve)

      set(
        produce((state) => {
          state.createPool.transactionState.txStatus = 'CONFIRMING'
        })
      )

      if (swapType === CRYPTOSWAP) {
        // ----- TRICRYPTO -----
        if (isTricrypto(networks[chainId].tricryptoFactory, tokenAmount, tokenA, tokenB, tokenC)) {
          const coins = [tokenA.address, tokenB.address, tokenC.address]

          try {
            const deployPoolTx = await curve.tricryptoFactory.deployPool(
              poolName,
              poolSymbol,
              coins,
              cryptoA,
              gamma,
              midFee,
              outFee,
              allowedExtraProfit,
              feeGamma,
              adjustmentStep,
              +maHalfTime,
              initialPrice.initialPrice
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = networks[chainId].scanTxPath(deployPoolTx.hash)
              })
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.tricryptoFactory.getDeployedPoolAddress(deployPoolTx)
            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              })
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)

            const poolId = await curve.tricryptoFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              })
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                })
              )
            }
          } catch (error) {
            if (typeof dismissNotificationHandler === 'function') {
              dismissNotificationHandler()
            }

            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'ERROR'
                state.createPool.transactionState.errorMessage = error.message
              })
            )
            console.log(error)
          }
          // ----- TWOCRYPTO -----
        } else {
          const coins = [tokenA.address, tokenB.address]

          try {
            const maExpTime = Math.round(+maHalfTime / 0.693)

            const deployPoolTx = await curve.twocryptoFactory.deployPool(
              poolName,
              poolSymbol,
              coins,
              cryptoA,
              gamma,
              midFee,
              outFee,
              allowedExtraProfit,
              feeGamma,
              adjustmentStep,
              maExpTime,
              initialPrice.initialPrice[0]
            )

            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = networks[chainId].scanTxPath(deployPoolTx.hash)
              })
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.twocryptoFactory.getDeployedPoolAddress(deployPoolTx)
            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              })
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)

            const poolId = await curve.twocryptoFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              })
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                })
              )
            }
          } catch (error) {
            if (typeof dismissNotificationHandler === 'function') {
              dismissNotificationHandler()
            }
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'ERROR'
                state.createPool.transactionState.errorMessage = error.message
              })
            )
          }
        }

        // ----- STABLE META POOL -----
      } else if (swapType === STABLESWAP && metaPoolToken) {
        // convert token address of basepool to pool address of basepool
        const convertTokenAddressToPoolAddress = (val: string) => {
          let newValue = ''
          get().pools.basePools[chainId].find((item) => {
            if (item.token.toLowerCase() === val.toLowerCase()) newValue = item.pool
          })
          return newValue === '' ? val : newValue
        }

        const basePool = tokenA.basePool
          ? convertTokenAddressToPoolAddress(tokenA.address)
          : convertTokenAddressToPoolAddress(tokenB.address)
        const coin = tokenA.basePool ? tokenB : tokenA
        const implementationIdx = implementation === 1 ? 1 : 0

        if (networks[chainId].stableswapFactory) {
          // STABLE NG META
          try {
            const oracleAddress =
              coin.ngAssetType === 1 ? coin.oracleAddress : '0x0000000000000000000000000000000000000000'
            const oracleFunction = coin.ngAssetType === 1 ? coin.oracleFunction : '0x00000000'
            const maExpTimeFormatted = Math.round(+maExpTime / 0.693)

            const deployPoolTx = await curve.stableNgFactory.deployMetaPool(
              basePool,
              poolName,
              poolSymbol,
              coin.address,
              stableA,
              stableSwapFee,
              offpegFeeMultiplier,
              maExpTimeFormatted,
              0,
              coin.ngAssetType,
              oracleFunction,
              oracleAddress
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = networks[chainId].scanTxPath(deployPoolTx.hash)
              })
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.stableNgFactory.getDeployedMetaPoolAddress(deployPoolTx)

            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              })
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)

            const poolId = await curve.stableNgFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              })
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                })
              )
            }
          } catch (error) {
            if (typeof dismissNotificationHandler === 'function') {
              dismissNotificationHandler()
            }
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'ERROR'
                state.createPool.transactionState.errorMessage = error.message
              })
            )
            console.log(error)
          }
          // STABLE META
        } else {
          try {
            const deployPoolTx = await curve.factory.deployMetaPool(
              basePool,
              poolName,
              poolSymbol,
              coin.address,
              stableA,
              stableSwapFee,
              implementationIdx
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = networks[chainId].scanTxPath(deployPoolTx.hash)
              })
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.factory.getDeployedMetaPoolAddress(deployPoolTx)
            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              })
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)

            const poolId = await curve.factory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              })
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                })
              )
            }
          } catch (error) {
            if (typeof dismissNotificationHandler === 'function') {
              dismissNotificationHandler()
            }
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'ERROR'
                state.createPool.transactionState.errorMessage = error.message
              })
            )
            console.log(error)
          }
        }
        // ----- STABLE PLAIN POOL -----
      } else {
        // STABLE NG
        if (networks[chainId].stableswapFactory) {
          const coins = [tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH].filter(
            (coin) => coin.address !== ''
          )

          try {
            const coinAddresses = coins.map((coin) => coin.address)
            const assetTypes = coins.map((coin) => coin.ngAssetType)
            const oracleAddresses = coins.map((coin) =>
              coin.ngAssetType === 1 ? coin.oracleAddress : '0x0000000000000000000000000000000000000000'
            )
            const oracleFunctions = coins.map((coin) => (coin.ngAssetType === 1 ? coin.oracleFunction : '0x00000000'))
            const maExpTimeFormatted = Math.round(+maExpTime / 0.693)

            const deployPoolTx = await curve.stableNgFactory.deployPlainPool(
              poolName,
              poolSymbol,
              coinAddresses,
              stableA,
              stableSwapFee,
              offpegFeeMultiplier,
              assetTypes,
              0,
              maExpTimeFormatted,
              oracleAddresses,
              oracleFunctions
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = networks[chainId].scanTxPath(deployPoolTx.hash)
              })
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.stableNgFactory.getDeployedPlainPoolAddress(deployPoolTx)
            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              })
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)

            const poolId = await curve.stableNgFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              })
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                })
              )
            }
          } catch (error) {
            if (typeof dismissNotificationHandler === 'function') {
              dismissNotificationHandler()
            }
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'ERROR'
                state.createPool.transactionState.errorMessage = error.message
              })
            )
            console.log(error)
          }
        } else {
          // STABLE PLAIN (Old)
          const coins = [tokenA.address, tokenB.address, tokenC.address, tokenD.address].filter((coin) => coin !== '')

          const assetTypeNumber = () => {
            if (assetType === 'USD') return 0
            if (assetType === 'ETH') return 1
            if (assetType === 'BTC') return 2
            return 3
          }

          try {
            const deployPoolTx = await curve.factory.deployPlainPool(
              poolName,
              poolSymbol,
              coins,
              stableA,
              stableSwapFee,
              assetTypeNumber(),
              implementation
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = networks[chainId].scanTxPath(deployPoolTx.hash)
              })
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.factory.getDeployedPlainPoolAddress(deployPoolTx)
            // deploy pool tx success

            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              })
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)

            const poolId = await curve.factory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              })
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                })
              )
            }
          } catch (error) {
            if (typeof dismissNotificationHandler === 'function') {
              dismissNotificationHandler()
            }
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'ERROR'
                state.createPool.transactionState.errorMessage = error.message
              })
            )
            console.log(error)
          }
        }
      }
    },
    resetState: () =>
      set(
        produce((state) => {
          state.createPool = { ...state.createPool, ...DEFAULT_CREATE_POOL_STATE }
        })
      ),
  },
})

export default createCreatePoolSlice
