import { BigNumber } from 'bignumber.js'
import type { ContractTransactionResponse } from 'ethers'
import { produce } from 'immer'
import { zeroAddress } from 'viem'
import type { StoreApi } from 'zustand'
import {
  CRYPTOSWAP,
  POOL_PRESETS,
  STABLESWAP,
  FXSWAP,
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
  NG_ASSET_TYPE,
} from '@/dex/components/PageCreatePool/constants'
import {
  CreateToken,
  NgAssetType,
  SwapType,
  TokenId,
  TokenState,
  OracleType,
  Erc4626Type,
} from '@/dex/components/PageCreatePool/types'
import { isTricrypto } from '@/dex/components/PageCreatePool/utils'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi } from '@/dex/types/main.types'
import { TwoCryptoImplementation } from '@curvefi/api/lib/constants/twoCryptoImplementations'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { fetchTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { INVALID_POOLS_NAME_CHARACTERS } from '../constants'
import { fetchNetworks, getNetworks } from '../entities/networks'

type SliceState = {
  navigationIndex: number
  swapType: SwapType
  advanced: boolean
  poolPresetIndex: number | null
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
    updateSwapType: (type: SwapType, chainId: ChainId) => void
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
      tokenH: TokenState,
    ) => void
    clearToken: (tokenId: TokenId) => void
    updateNgAssetType: (tokenId: TokenId, value: NgAssetType) => void
    updateTokenErc4626Status: (tokenId: TokenId, status: TokenState['erc4626']) => void
    updateOracleState: (tokenId: TokenId, status: OracleType) => void
    updateOracleAddress: (tokenId: TokenId, oracleAddress: string) => void
    updateOracleFunction: (tokenId: TokenId, oracleFunction: string) => void
    updateUserAddedTokens: (address: string, symbol: string, haveSameTokenName: boolean, basePool: boolean) => void
    updateInitialPrice: (priceA: number, priceB: number, priceC: number) => void
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
    updatePoolTypeValidation: (poolType: boolean) => void
    updateTokensInPoolValidation: (tokensInPool: boolean) => void
    updateParametersValidation: (parameters: boolean) => void
    updatePoolInfoValidation: (poolInfo: boolean) => void
    deployPool: (curve: CurveApi) => void
    resetState: () => void
  }
}

const ORACLE_FUNCTION_NULL_VALUE = '0x00000000'

export const DEFAULT_ERC4626_STATUS: Erc4626Type = {
  isErc4626: false,
  isLoading: false,
  error: null,
  isSuccess: false,
}
export const DEFAULT_ORACLE_STATUS: OracleType = {
  isLoading: false,
  error: null,
  isSuccess: false,
  address: '',
  functionName: '',
  rate: undefined,
  decimals: undefined,
}

const DEFAULT_TOKEN_STATE: TokenState = {
  address: '',
  symbol: '',
  ngAssetType: NG_ASSET_TYPE.STANDARD,
  basePool: false,
  erc4626: { ...DEFAULT_ERC4626_STATUS },
  oracle: { ...DEFAULT_ORACLE_STATUS },
}

export const DEFAULT_CREATE_POOL_STATE = {
  navigationIndex: 0,
  advanced: false,
  swapType: '' as const,
  poolPresetIndex: null,
  tokensInPool: {
    tokenAmount: 2,
    metaPoolToken: false,
    [TOKEN_A]: {
      ...DEFAULT_TOKEN_STATE,
    },
    [TOKEN_B]: {
      ...DEFAULT_TOKEN_STATE,
    },
    [TOKEN_C]: {
      ...DEFAULT_TOKEN_STATE,
    },
    [TOKEN_D]: {
      ...DEFAULT_TOKEN_STATE,
    },
    [TOKEN_E]: {
      ...DEFAULT_TOKEN_STATE,
    },
    [TOKEN_F]: {
      ...DEFAULT_TOKEN_STATE,
    },
    [TOKEN_G]: {
      ...DEFAULT_TOKEN_STATE,
    },
    [TOKEN_H]: {
      ...DEFAULT_TOKEN_STATE,
    },
  },
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
    fetchPoolStatus: '',
    poolAddress: '',
    poolId: '',
    lpTokenAddress: '',
    errorMessage: null,
  },
} as const satisfies SliceState

const calculateInitialPrice = (tokenA: number, tokenB: number) => {
  const initialPrice = new BigNumber(tokenB).div(new BigNumber(tokenA)).toNumber()

  // convert to 4 meaningful numbers
  if (initialPrice >= 1000) return initialPrice.toFixed(0).toString()
  if (initialPrice >= 100) return initialPrice.toFixed(1).toString()
  if (initialPrice >= 10) return initialPrice.toFixed(2).toString()
  if (initialPrice >= 1) return initialPrice.toFixed(3).toString()
  return initialPrice.toPrecision(4).toString()
}

export const createCreatePoolSlice = (
  set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): CreatePoolSlice => ({
  createPool: {
    ...DEFAULT_CREATE_POOL_STATE,
    setNavigationIndex: (index: number) => {
      set(
        produce((state) => {
          state.createPool.navigationIndex = index
        }),
      )
    },
    updateAdvanced: (boolean: boolean) => {
      set(
        produce((state) => {
          state.createPool.advanced = boolean
        }),
      )
    },
    updateSwapType: (swapType: SwapType, chainId: ChainId) => {
      // set allowed token amount
      const networks = getNetworks()
      if (swapType === CRYPTOSWAP) {
        const amount = networks[chainId].twocryptoFactory || networks[chainId].twocryptoFactory ? 2 : 3

        set(
          produce((state) => {
            state.createPool.tokensInPool.tokenAmount = amount
          }),
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
            }),
          )
        }
        if (tokenB.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_B] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_B]
              state.createPool.tokensInPool.metaPoolToken = false
            }),
          )
        }
        if (tokenC.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_C] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_C]
            }),
          )
        }
        if (tokenD.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_D] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_D]
            }),
          )
        }
        if (tokenE.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_E] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_E]
            }),
          )
        }
        if (tokenF.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_F] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_F]
            }),
          )
        }
        if (tokenG.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_G] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_G]
            }),
          )
        }
        if (tokenH.basePool) {
          set(
            produce((state) => {
              state.createPool.tokensInPool[TOKEN_H] = DEFAULT_CREATE_POOL_STATE.tokensInPool[TOKEN_H]
            }),
          )
        }
      }

      set(
        produce((state) => {
          state.createPool.parameters = DEFAULT_CREATE_POOL_STATE.parameters
          state.createPool.poolPresetIndex = null
          state.createPool.swapType = swapType
        }),
      )
    },
    updatePoolPresetIndex: (presetIndex: number) => {
      set(
        produce((state) => {
          state.createPool.poolPresetIndex = presetIndex
          state.createPool.parameters = POOL_PRESETS[presetIndex].defaultParams
        }),
      )
    },
    resetPoolPresetIndex: () => {
      set(
        produce((state) => {
          state.createPool.parameters = DEFAULT_CREATE_POOL_STATE.parameters
          state.createPool.poolPresetIndex = null
        }),
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
      tokenH: TokenState,
    ) => {
      const currentTokens = get().createPool.tokensInPool
      const tokensInPoolUpdates = {
        ...currentTokens,
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
      }
      tokensInPoolUpdates.tokenB = {
        ...tokenB,
        basePool: tokenB.basePool,
      }

      // Preserve erc4626 statuses and ngAssetType when tokens are rearranged. Status follows the address.
      const syncTokenStatuses = () => {
        const tokenIds = [TOKEN_A, TOKEN_B, TOKEN_C, TOKEN_D, TOKEN_E, TOKEN_F, TOKEN_G, TOKEN_H] as const

        const statusByAddress = new Map(
          notFalsy(
            ...tokenIds.map(
              (id) =>
                currentTokens[id].address &&
                ([
                  currentTokens[id].address.toLowerCase(),
                  { erc4626: currentTokens[id].erc4626, ngAssetType: currentTokens[id].ngAssetType },
                ] as const),
            ),
          ),
        )

        for (const id of tokenIds) {
          const token = tokensInPoolUpdates[id]
          const address = token.address?.toLowerCase()
          const status = address ? statusByAddress.get(address) : undefined
          tokensInPoolUpdates[id] = {
            ...token,
            erc4626: status ? { ...status.erc4626 } : { ...DEFAULT_ERC4626_STATUS },
            ngAssetType: token.basePool ? NG_ASSET_TYPE.STANDARD : (status?.ngAssetType ?? token.ngAssetType),
          }
        }
      }

      const initialPriceUpdates = {
        ...get().createPool.initialPrice,
      }

      const { chainId } = curve

      // set token prices
      if (tokenA.address !== '') {
        const tokenAPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenA.address })
        initialPriceUpdates.tokenA = Number(tokenAPriceRaw)
      }
      if (tokenB.address !== '') {
        const tokenBPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenB.address })
        initialPriceUpdates.tokenB = Number(tokenBPriceRaw)
      }
      if (tokenC.address !== '') {
        const tokenCPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenC.address })
        initialPriceUpdates.tokenC = Number(tokenCPriceRaw)
      }
      if (tokenD.address !== '') {
        const tokenDPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenD.address })
        initialPriceUpdates.tokenD = Number(tokenDPriceRaw)
      }
      if (tokenE.address !== '') {
        const tokenEPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenE.address })
        initialPriceUpdates.tokenE = Number(tokenEPriceRaw)
      }
      if (tokenF.address !== '') {
        const tokenFPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenF.address })
        initialPriceUpdates.tokenF = Number(tokenFPriceRaw)
      }
      if (tokenG.address !== '') {
        const tokenGPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenG.address })
        initialPriceUpdates.tokenG = Number(tokenGPriceRaw)
      }
      if (tokenH.address !== '') {
        const tokenHPriceRaw = await fetchTokenUsdRate({ chainId, tokenAddress: tokenH.address })
        initialPriceUpdates.tokenH = Number(tokenHPriceRaw)
      }

      initialPriceUpdates.initialPrice = [
        calculateInitialPrice(initialPriceUpdates.tokenA, initialPriceUpdates.tokenB),
        calculateInitialPrice(initialPriceUpdates.tokenA, initialPriceUpdates.tokenC),
      ]

      syncTokenStatuses()

      set(
        produce((state) => {
          state.createPool.tokensInPool = tokensInPoolUpdates
          state.createPool.initialPrice = initialPriceUpdates
        }),
      )
    },
    clearToken: (tokenId: TokenId) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId] = DEFAULT_CREATE_POOL_STATE.tokensInPool[tokenId]
          state.createPool.tokensInPool.metaPoolToken = get().createPool.tokensInPool[tokenId].basePool
            ? false
            : get().createPool.tokensInPool.metaPoolToken
        }),
      )
    },
    updateNgAssetType: (tokenId: TokenId, value: NgAssetType) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].ngAssetType = value
        }),
      )
    },
    updateTokenErc4626Status: (tokenId: TokenId, status: TokenState['erc4626']) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].erc4626 = { ...status }
        }),
      )
    },
    updateOracleState: (tokenId: TokenId, status: OracleType) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].oracle = { ...status }
        }),
      )
    },
    updateOracleAddress: (tokenId: TokenId, oracleAddress: string) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].oracle.address = oracleAddress
        }),
      )
    },
    updateOracleFunction: (tokenId: TokenId, functionName: string) => {
      set(
        produce((state) => {
          state.createPool.tokensInPool[tokenId].oracle.functionName = functionName
        }),
      )
    },
    updateTokenAmount: (amount: number) =>
      set(
        produce((state) => {
          state.createPool.tokensInPool.tokenAmount = amount
        }),
      ),
    updateUserAddedTokens: (address, symbol, haveSameTokenName, basePool) =>
      set(
        produce((state) => {
          state.createPool.userAddedTokens.push({
            address: address.toLowerCase(),
            symbol,
            haveSameTokenName,
            userAddedToken: true,
            basePool,
          })
        }),
      ),
    updateInitialPrice: (tokenA: number, tokenB: number, tokenC: number) =>
      set(
        produce((state) => {
          state.createPool.initialPrice.initialPrice = [
            calculateInitialPrice(tokenA, tokenB),
            calculateInitialPrice(tokenA, tokenC),
          ]
        }),
      ),
    updateTokenPrice: (tokenId: TokenId, price: number) => {
      if (tokenId === TOKEN_A) {
        get().createPool.updateInitialPrice(
          price,
          get().createPool.initialPrice[TOKEN_B],
          get().createPool.initialPrice[TOKEN_C],
        )

        set(
          produce((state) => {
            state.createPool.initialPrice[TOKEN_A] = price
          }),
        )
      }
      if (tokenId === TOKEN_B) {
        get().createPool.updateInitialPrice(
          get().createPool.initialPrice[TOKEN_A],
          price,
          get().createPool.initialPrice[TOKEN_C],
        )

        set(
          produce((state) => {
            state.createPool.initialPrice[TOKEN_B] = price
          }),
        )
      }
      if (tokenId === TOKEN_C) {
        get().createPool.updateInitialPrice(
          get().createPool.initialPrice[TOKEN_A],
          get().createPool.initialPrice[TOKEN_B],
          price,
        )

        set(
          produce((state) => {
            state.createPool.initialPrice[TOKEN_C] = price
          }),
        )
      }
    },
    refreshInitialPrice: async (curve: CurveApi) => {
      const { chainId } = curve

      const tokenAPriceRaw = await fetchTokenUsdRate({
        chainId,
        tokenAddress: get().createPool.tokensInPool[TOKEN_A].address,
      })
      const tokenBPriceRaw = await fetchTokenUsdRate({
        chainId,
        tokenAddress: get().createPool.tokensInPool[TOKEN_B].address,
      })
      const tokenCPriceRaw = await fetchTokenUsdRate({
        chainId,
        tokenAddress: get().createPool.tokensInPool[TOKEN_C].address,
      })
      const tokenAPrice = Number(tokenAPriceRaw)
      const tokenBPrice = Number(tokenBPriceRaw)
      const tokenCPrice = Number(tokenCPriceRaw)

      get().createPool.updateInitialPrice(tokenAPrice, tokenBPrice, tokenCPrice)

      set(
        produce((state) => {
          state.createPool.initialPrice = {
            ...get().createPool.initialPrice,
            [TOKEN_A]: tokenAPrice,
            [TOKEN_B]: tokenBPrice,
            [TOKEN_C]: tokenCPrice,
          }
        }),
      )
    },
    updateStableSwapFee: (fee: string) =>
      set(
        produce((state) => {
          state.createPool.parameters.stableSwapFee = fee
        }),
      ),
    updateMidFee: (fee: string) =>
      set(
        produce((state) => {
          state.createPool.parameters.midFee = fee
        }),
      ),
    updateOutFee: (fee: string) =>
      set(
        produce((state) => {
          state.createPool.parameters.outFee = fee
        }),
      ),
    updateStableA: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.stableA = new BigNumber(value).toString()
        }),
      ),
    updateCryptoA: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.cryptoA = new BigNumber(value).toString()
        }),
      ),
    updateGamma: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.gamma = typeof value === 'string' ? value : new BigNumber(value).toString()
        }),
      ),
    updateAllowedExtraProfit: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.allowedExtraProfit =
            typeof value === 'string' ? value : new BigNumber(value).toString()
        }),
      ),
    updateFeeGamma: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.feeGamma = typeof value === 'string' ? value : new BigNumber(value).toString()
        }),
      ),
    updateAdjustmentStep: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.adjustmentStep =
            typeof value === 'string' ? value : new BigNumber(value).toString()
        }),
      ),
    updateMaHalfTime: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.maHalfTime = typeof value === 'string' ? value : new BigNumber(value).toString()
        }),
      ),
    updateMaExpTime: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.maExpTime = typeof value === 'string' ? value : new BigNumber(value).toString()
        }),
      ),
    updateOffpegFeeMultiplier: (value: number | string) =>
      set(
        produce((state) => {
          state.createPool.parameters.offpegFeeMultiplier =
            typeof value === 'string' ? value : new BigNumber(value).toString()
        }),
      ),
    updatePoolName: (name: string) =>
      set(
        produce((state) => {
          state.createPool.poolName = name
        }),
      ),
    updatePoolSymbol: (symbol: string) =>
      set(
        produce((state) => {
          state.createPool.poolSymbol = symbol
        }),
      ),
    updatePoolTypeValidation: (poolType: boolean) => {
      set(
        produce((state) => {
          state.createPool.validation.poolType = poolType
        }),
      )
    },
    updateTokensInPoolValidation: (tokensInPool: boolean) => {
      set(
        produce((state) => {
          state.createPool.validation.tokensInPool = tokensInPool
        }),
      )
    },
    updateParametersValidation: (parameters: boolean) => {
      set(
        produce((state) => {
          state.createPool.validation.parameters = parameters
        }),
      )
    },
    updatePoolInfoValidation: (poolInfo: boolean) => {
      set(
        produce((state) => {
          // Also check for invalid characters in pool name
          const { poolName } = state.createPool
          const invalidChars = INVALID_POOLS_NAME_CHARACTERS.filter((c) => poolName.includes(c))
          state.createPool.validation.poolInfo = poolInfo && !invalidChars.length
        }),
      )
    },
    deployPool: async (curve: CurveApi) => {
      const chainId = curve.chainId
      const {
        pools: { fetchNewPool, basePools },
        createPool: {
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
          initialPrice,
        },
      } = get()

      let dismissNotificationHandler

      const notifyPendingMessage = t`Please confirm to create pool ${poolName}.`
      const { dismiss: dismissConfirm } = notify(notifyPendingMessage, 'pending')

      dismissNotificationHandler = dismissConfirm

      set(
        produce((state) => {
          state.createPool.transactionState.txStatus = 'CONFIRMING'
        }),
      )

      const networks = await fetchNetworks()
      if (swapType === FXSWAP) {
        // ----- FXSWAP -----
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
            initialPrice.initialPrice[0],
            TwoCryptoImplementation.FX_REGULAR_50_PERCENT,
          )

          set(
            produce((state) => {
              state.createPool.transactionState.txStatus = 'LOADING'
              state.createPool.transactionState.transaction = deployPoolTx
              state.createPool.transactionState.txLink = scanTxPath(networks[chainId], deployPoolTx.hash)
            }),
          )

          // set up deploying message
          dismissConfirm()
          const deployingNotificationMessage = t`Deploying pool ${poolName}...`
          const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')
          dismissNotificationHandler = dismissDeploying

          const poolAddress = await curve.twocryptoFactory.getDeployedPoolAddress(deployPoolTx)
          // deploy pool tx success
          set(
            produce((state) => {
              state.createPool.transactionState.txStatus = 'SUCCESS'
              state.createPool.transactionState.txSuccess = true
              state.createPool.transactionState.fetchPoolStatus = 'LOADING'
              state.createPool.transactionState.poolAddress = poolAddress
            }),
          )

          // set up success message
          dismissDeploying()
          const successNotificationMessage = t`Pool ${poolName} deployment successful.`
          notify(successNotificationMessage, 'success')

          const poolId = await curve.twocryptoFactory.fetchRecentlyDeployedPool(poolAddress)
          set(
            produce((state) => {
              state.createPool.transactionState.poolId = poolId
            }),
          )

          const poolData = await fetchNewPool(curve, poolId)
          if (poolData) {
            set(
              produce((state) => {
                state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
              }),
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
            }),
          )
        }
      } else if (swapType === CRYPTOSWAP) {
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
              initialPrice.initialPrice,
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = scanTxPath(networks[chainId], deployPoolTx.hash)
              }),
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.tricryptoFactory.getDeployedPoolAddress(deployPoolTx)
            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              }),
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notify(successNotificationMessage, 'success')

            const poolId = await curve.tricryptoFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              }),
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                }),
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
              }),
            )
            console.warn(error)
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
              initialPrice.initialPrice[0],
            )

            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = scanTxPath(networks[chainId], deployPoolTx.hash)
              }),
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.twocryptoFactory.getDeployedPoolAddress(deployPoolTx)
            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              }),
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notify(successNotificationMessage, 'success')

            const poolId = await curve.twocryptoFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              }),
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                }),
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
              }),
            )
          }
        }

        // ----- STABLE META POOL -----
      } else if (swapType === STABLESWAP && metaPoolToken) {
        // convert token address of basepool to pool address of basepool
        const convertTokenAddressToPoolAddress = (val: string) => {
          let newValue = ''
          basePools[chainId].find((item) => {
            if (item.token.toLowerCase() === val.toLowerCase()) newValue = item.pool
          })
          return newValue === '' ? val : newValue
        }

        const basePool = tokenA.basePool
          ? convertTokenAddressToPoolAddress(tokenA.address)
          : convertTokenAddressToPoolAddress(tokenB.address)
        const coin = tokenA.basePool ? tokenB : tokenA

        if (networks[chainId].stableswapFactory) {
          // STABLE NG META
          try {
            const oracleAddress = coin.ngAssetType === NG_ASSET_TYPE.ORACLE ? coin.oracle.address : zeroAddress
            const oracleFunction =
              coin.ngAssetType === NG_ASSET_TYPE.ORACLE ? coin.oracle.functionName : ORACLE_FUNCTION_NULL_VALUE
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
              oracleAddress,
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = scanTxPath(networks[chainId], deployPoolTx.hash)
              }),
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.stableNgFactory.getDeployedMetaPoolAddress(deployPoolTx)

            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              }),
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notify(successNotificationMessage, 'success')

            const poolId = await curve.stableNgFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              }),
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                }),
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
              }),
            )
            console.warn(error)
          }
        }
        // ----- STABLE PLAIN POOL -----
      } else {
        // STABLE NG
        if (networks[chainId].stableswapFactory) {
          const coins = [tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH].filter(
            (coin) => coin.address !== '',
          )

          try {
            const coinAddresses = coins.map((coin) => coin.address)
            const assetTypes = coins.map((coin) => coin.ngAssetType)
            const oracleAddresses = coins.map((coin) =>
              coin.ngAssetType === NG_ASSET_TYPE.ORACLE ? coin.oracle.address : zeroAddress,
            )
            const oracleFunctions = coins.map((coin) =>
              coin.ngAssetType === NG_ASSET_TYPE.ORACLE ? coin.oracle.functionName : ORACLE_FUNCTION_NULL_VALUE,
            )
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
              oracleFunctions,
            )
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'LOADING'
                state.createPool.transactionState.transaction = deployPoolTx
                state.createPool.transactionState.txLink = scanTxPath(networks[chainId], deployPoolTx.hash)
              }),
            )

            // set up deploying message
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying pool ${poolName}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')
            dismissNotificationHandler = dismissDeploying

            const poolAddress = await curve.stableNgFactory.getDeployedPlainPoolAddress(deployPoolTx)
            // deploy pool tx success
            set(
              produce((state) => {
                state.createPool.transactionState.txStatus = 'SUCCESS'
                state.createPool.transactionState.txSuccess = true
                state.createPool.transactionState.fetchPoolStatus = 'LOADING'
                state.createPool.transactionState.poolAddress = poolAddress
              }),
            )

            // set up success message
            dismissDeploying()
            const successNotificationMessage = t`Pool ${poolName} deployment successful.`
            notify(successNotificationMessage, 'success')

            const poolId = await curve.stableNgFactory.fetchRecentlyDeployedPool(poolAddress)
            set(
              produce((state) => {
                state.createPool.transactionState.poolId = poolId
              }),
            )

            const poolData = await fetchNewPool(curve, poolId)
            if (poolData) {
              set(
                produce((state) => {
                  state.createPool.transactionState.fetchPoolStatus = 'SUCCESS'
                  state.createPool.transactionState.lpTokenAddress = poolData.pool.lpToken
                }),
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
              }),
            )
            console.warn(error)
          }
        }
      }
    },
    resetState: () =>
      set(
        produce((state) => {
          state.createPool = { ...state.createPool, ...DEFAULT_CREATE_POOL_STATE }
        }),
      ),
  },
})
