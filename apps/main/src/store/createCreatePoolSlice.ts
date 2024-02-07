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
} from '@/components/PageCreatePool/constants'
import { checkMetaPool, isTricrypto } from '@/components/PageCreatePool/utils'

type SliceState = {
  navigationIndex: number
  swapType: SwapType
  advanced: boolean
  poolPresetIndex: number
  tokensInPool: {
    tokenAmount: number
    metaPoolToken: boolean
    tokenA: TokenState
    tokenB: TokenState
    tokenC: TokenState
    tokenD: TokenState
  }
  userAddedTokens: CreateToken[]
  initialPrice: {
    tokenAPrice: number
    tokenBPrice: number
    tokenCPrice: number
    tokenDPrice: number
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
      chainId: ChainId
    ) => void
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
    tokenA: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    tokenB: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    tokenC: {
      address: '',
      symbol: '',
      ngAssetType: 0,
      basePool: false,
      oracleAddress: '',
      oracleFunction: '',
    },
    tokenD: {
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
    tokenAPrice: 0,
    tokenBPrice: 0,
    tokenCPrice: 0,
    tokenDPrice: 0,
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
  return new BigNumber(tokenB).div(new BigNumber(tokenA)).toString()
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
        const amount = networks[chainId].cryptoSwapFactory ? 2 : 3

        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenAmount = amount
          })
        )
      }

      // clean up if multiple basepools were selected when changing from CRYPTOSWAP
      if (swapType === STABLESWAP) {
        const { tokenA, tokenB, tokenC, tokenD } = get().createPool.tokensInPool

        if (checkMetaPool(tokenA.address, chainId)) {
          set(
            produce((state) => {
              state.createPool.tokensInPool.tokenAmount = 2
            })
          )
        }
        if (checkMetaPool(tokenB.address, chainId)) {
          set(
            produce((state) => {
              state.createPool.tokensInPool.tokenB = DEFAULT_CREATE_POOL_STATE.tokensInPool.tokenB
            })
          )
        }
        if (checkMetaPool(tokenC.address, chainId)) {
          set(
            produce((state) => {
              state.createPool.tokensInPool.tokenC = DEFAULT_CREATE_POOL_STATE.tokensInPool.tokenC
            })
          )
        }
        if (checkMetaPool(tokenD.address, chainId)) {
          set(
            produce((state) => {
              state.createPool.tokensInPool.tokenD = DEFAULT_CREATE_POOL_STATE.tokensInPool.tokenD
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
      chainId: ChainId
    ) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool = {
            tokenAmount:
              (checkMetaPool(tokenA.address, chainId) || checkMetaPool(tokenB.address, chainId)) &&
              get().createPool.swapType === STABLESWAP
                ? 2
                : get().createPool.tokensInPool.tokenAmount,
            metaPoolToken: checkMetaPool(tokenA.address, chainId) || checkMetaPool(tokenB.address, chainId),
            tokenA: {
              ...tokenA,
              basePool: checkMetaPool(tokenA.address, chainId),
              ngAssetType: checkMetaPool(tokenA.address, chainId)
                ? 0
                : get().createPool.tokensInPool.tokenA.ngAssetType,
            },
            tokenB: {
              ...tokenB,
              basePool: checkMetaPool(tokenB.address, chainId),
              ngAssetType: checkMetaPool(tokenB.address, chainId)
                ? 0
                : get().createPool.tokensInPool.tokenB.ngAssetType,
            },
            tokenC,
            tokenD,
          }
        })
      )

      // set token prices
      if (tokenA.address !== '') {
        const tokenAPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenA.address)
        set(
          produce((state) => {
            state.createPool.initialPrice.tokenAPrice = Number(tokenAPriceRaw)
          })
        )
        get().createPool.updateInitialPrice(
          Number(tokenAPriceRaw),
          get().createPool.initialPrice.tokenBPrice,
          get().createPool.initialPrice.tokenCPrice
        )
      }
      if (tokenB.address !== '') {
        const tokenBPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenB.address)
        set(
          produce((state) => {
            state.createPool.initialPrice.tokenBPrice = Number(tokenBPriceRaw)
          })
        )
        get().createPool.updateInitialPrice(
          get().createPool.initialPrice.tokenAPrice,
          Number(tokenBPriceRaw),
          get().createPool.initialPrice.tokenCPrice
        )
      }
      if (tokenC.address !== '') {
        const tokenCPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenC.address)
        set(
          produce((state) => {
            state.createPool.initialPrice.tokenCPrice = Number(tokenCPriceRaw)
          })
        )
        get().createPool.updateInitialPrice(
          get().createPool.initialPrice.tokenAPrice,
          get().createPool.initialPrice.tokenBPrice,
          Number(tokenCPriceRaw)
        )
      }
      if (tokenD.address !== '') {
        const tokenDPriceRaw = await get().usdRates.fetchUsdRateByToken(curve, tokenD.address)
        set(
          produce((state) => {
            state.createPool.initialPrice.tokenDPrice = Number(tokenDPriceRaw)
          })
        )
      }
    },
    updateNgAssetType: (tokenId: TokenId, value: NgAssetType) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].ngAssetType = value
        })
      )
    },
    updateOracleAddress: (tokenId: TokenId, oracleAddress: string) => {
      if (tokenId === TOKEN_A) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenA.oracleAddress = oracleAddress
          })
        )
      }
      if (tokenId === TOKEN_B) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenB.oracleAddress = oracleAddress
          })
        )
      }
      if (tokenId === TOKEN_C) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenC.oracleAddress = oracleAddress
          })
        )
      }
      if (tokenId === TOKEN_D) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenD.oracleAddress = oracleAddress
          })
        )
      }
    },
    updateOracleFunction: (tokenId: TokenId, oracleFunction: string) => {
      if (tokenId === TOKEN_A) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenA.oracleFunction = oracleFunction
          })
        )
      }
      if (tokenId === TOKEN_B) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenB.oracleFunction = oracleFunction
          })
        )
      }
      if (tokenId === TOKEN_C) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenC.oracleFunction = oracleFunction
          })
        )
      }
      if (tokenId === TOKEN_D) {
        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenD.oracleFunction = oracleFunction
          })
        )
      }
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
        set(
          produce((state) => {
            get().createPool.updateInitialPrice(
              price,
              get().createPool.initialPrice.tokenBPrice,
              get().createPool.initialPrice.tokenCPrice
            )

            state.createPool.initialPrice = {
              ...get().createPool.initialPrice,
              tokenAPrice: price,
            }
          })
        )
      }
      if (tokenId === TOKEN_B) {
        set(
          produce((state) => {
            get().createPool.updateInitialPrice(
              get().createPool.initialPrice.tokenAPrice,
              price,
              get().createPool.initialPrice.tokenCPrice
            )

            state.createPool.initialPrice = {
              ...get().createPool.initialPrice,
              tokenBPrice: price,
            }
          })
        )
      }
      if (tokenId === TOKEN_C) {
        set(
          produce((state) => {
            get().createPool.updateInitialPrice(
              get().createPool.initialPrice.tokenAPrice,
              get().createPool.initialPrice.tokenBPrice,
              price
            )

            state.createPool.initialPrice = {
              ...get().createPool.initialPrice,
              tokenCPrice: price,
            }
          })
        )
      }
    },
    refreshInitialPrice: async (curve: CurveApi) => {
      const tokenAPriceRaw = await get().usdRates.fetchUsdRateByToken(
        curve,
        get().createPool.tokensInPool.tokenA.address
      )
      const tokenBPriceRaw = await get().usdRates.fetchUsdRateByToken(
        curve,
        get().createPool.tokensInPool.tokenB.address
      )
      const tokenCPriceRaw = await get().usdRates.fetchUsdRateByToken(
        curve,
        get().createPool.tokensInPool.tokenC.address
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
        tokensInPool: { tokenAmount, metaPoolToken, tokenA, tokenB, tokenC, tokenD },
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
            const deployPoolTx = await curve.cryptoFactory.deployPool(
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

            const poolAddress = await curve.cryptoFactory.getDeployedPoolAddress(deployPoolTx)
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

            const poolId = await curve.cryptoFactory.fetchRecentlyDeployedPool(poolAddress)
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
          networks[chainId].basePools.find((item) => {
            if (item.token.toLowerCase() === val.toLowerCase()) newValue = item.pool
          })
          return newValue === '' ? val : newValue
        }

        const basePool = tokenA.basePool
          ? convertTokenAddressToPoolAddress(tokenA.address)
          : convertTokenAddressToPoolAddress(tokenB.address)
        const coin = tokenA.basePool ? tokenB : tokenA
        const implementationIdx = implementation === 1 ? 1 : 0

        if (networks[chainId].stableSwapNg) {
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
        if (networks[chainId].stableSwapNg) {
          const coins = [tokenA, tokenB, tokenC, tokenD].filter((coin) => coin.address !== '')

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
