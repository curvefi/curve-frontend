import { isAddress } from 'viem'
import { STABLESWAP, CRYPTOSWAP, FXSWAP, NG_ASSET_TYPE } from '@/dex/components/PageCreatePool/constants'
import type { SwapType, TokenState } from '@/dex/components/PageCreatePool/types'
import { BasePool } from '@/dex/types/main.types'
export const checkSwapType = (swapType: SwapType) => swapType !== ''

export const checkTokensInPoolUnset = (
  tokenA: TokenState,
  tokenB: TokenState,
  tokenC: TokenState,
  tokenD: TokenState,
  tokenE: TokenState,
  tokenF: TokenState,
  tokenG: TokenState,
  tokenH: TokenState,
) =>
  tokenA.address !== '' ||
  tokenB.address !== '' ||
  tokenC.address !== '' ||
  tokenD.address !== '' ||
  tokenE.address !== '' ||
  tokenF.address !== '' ||
  tokenG.address !== '' ||
  tokenH.address !== ''

export const checkTokensInPool = (
  swapType: SwapType,
  tokenA: TokenState,
  tokenB: TokenState,
  tokenC: TokenState,
  tokenD: TokenState,
  tokenE: TokenState,
  tokenF: TokenState,
  tokenG: TokenState,
  tokenH: TokenState,
  tricryptoEnabled: boolean,
  cryptoSwapEnabled: boolean,
) => {
  // make sure three tokens is selected when tricrypto but no twocrypto
  if (swapType === CRYPTOSWAP && tricryptoEnabled && !cryptoSwapEnabled) {
    return tokenA.address !== '' && tokenB.address !== '' && tokenC.address !== ''
  }

  if (containsOracle([tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH]) && swapType === STABLESWAP) {
    return (
      oraclesReady([tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH]) &&
      tokenA.address !== '' &&
      tokenB.address !== ''
    )
  }

  return tokenA.address !== '' && tokenB.address !== ''
}

export const checkParameters = (
  swapType: SwapType,
  stableSwapFee: string,
  midFee: string,
  initialPrice: string[],
  tokenAmount: number,
  tokenA: TokenState,
  tokenB: TokenState,
  tokenC: TokenState,
  tricryptoEnabled: boolean,
  poolPresetIndex: number | null,
) => {
  if (poolPresetIndex === null) return false
  if (swapType === STABLESWAP) return stableSwapFee !== null
  if (swapType === CRYPTOSWAP || swapType === FXSWAP) {
    if (isTricrypto(tricryptoEnabled, tokenAmount, tokenA, tokenB, tokenC))
      return midFee !== null && initialPrice[0] !== '0' && initialPrice[1] !== '0'
    return midFee !== null && initialPrice[0] !== '0'
  }
  return false
}

export const checkPoolInfo = (stableswapNg: boolean, swapType: SwapType, poolSymbol: string, poolName: string) =>
  poolSymbol !== '' && poolName !== '' && (swapType == STABLESWAP || stableswapNg)

export const validateOracleFunction = (functionName: string) => functionName.endsWith('()')

export const oraclesReady = (tokens: TokenState[]) => {
  const oracleTokens = tokens.filter((token) => token.ngAssetType === NG_ASSET_TYPE.ORACLE)
  const addressesValid = oracleTokens.every((token) => isAddress(token.oracle.address))
  const functionsValid = oracleTokens.every((token) => validateOracleFunction(token.oracle.functionName))
  const ratesValid = oracleTokens.every((token) => token.oracle.rate !== undefined)
  return addressesValid && functionsValid && ratesValid
}

export const containsOracle = (tokens: TokenState[]) =>
  tokens.some((token) => token.ngAssetType === NG_ASSET_TYPE.ORACLE && token.address !== '')

export const checkFormReady = (
  poolTypeValid: boolean,
  tokensInPoolValid: boolean,
  parametersValid: boolean,
  poolInfoValid: boolean,
) => poolTypeValid && tokensInPoolValid && parametersValid && poolInfoValid

export const isTricrypto = (
  tricryptoEnabled: boolean,
  tokenAmount: number,
  tokenA: TokenState,
  tokenB: TokenState,
  tokenC: TokenState,
) => tricryptoEnabled && tokenAmount === 3 && tokenA.address !== '' && tokenB.address !== '' && tokenC.address !== ''

export const checkMetaPool = (address: string, basePools: BasePool[]) =>
  address === '' ? false : basePools.some((item) => item.token === address)

export const getBasepoolCoins = (value: string, basePools: BasePool[], tokenA: TokenState, tokenB: TokenState) => {
  let basePoolCoins: string[] = []
  if (checkMetaPool(value, basePools) || tokenA.basePool || tokenB.basePool) {
    if (checkMetaPool(value, basePools)) {
      basePoolCoins = basePools.find((pool) => pool.token.toLowerCase() === value.toLowerCase())?.coins || []
    } else if (tokenA.basePool) {
      basePoolCoins = basePools.find((pool) => pool.token.toLowerCase() === tokenA.address.toLowerCase())?.coins || []
    } else if (tokenB.basePool) {
      basePoolCoins = basePools.find((pool) => pool.token.toLowerCase() === tokenB.address.toLowerCase())?.coins || []
    }
  }
  return basePoolCoins
}
