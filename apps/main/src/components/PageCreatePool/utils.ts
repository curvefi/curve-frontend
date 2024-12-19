import type { SwapType, TokenState } from '@/components/PageCreatePool/types'

import { STABLESWAP, CRYPTOSWAP } from '@/components/PageCreatePool/constants'

export const checkSwapType = (swapType: SwapType) => {
  return swapType !== ''
}

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
  poolPresetIndex: number,
) => {
  if (poolPresetIndex === null) return false
  if (swapType === STABLESWAP) return stableSwapFee !== null
  if (swapType === CRYPTOSWAP) {
    if (isTricrypto(tricryptoEnabled, tokenAmount, tokenA, tokenB, tokenC))
      return midFee !== null && initialPrice[0] !== '0' && initialPrice[1] !== '0'
    return midFee !== null && initialPrice[0] !== '0'
  }
  return false
}

export const checkPoolInfo = (
  stableswapNg: boolean,
  swapType: SwapType,
  poolSymbol: string,
  poolName: string,
  assetType: string,
) => {
  if (swapType === STABLESWAP) {
    if (stableswapNg) {
      return poolSymbol !== '' && poolName !== ''
    }
    return poolSymbol !== '' && poolName !== '' && assetType !== null
  }
  return poolSymbol !== '' && poolName !== ''
}

export const checkOracle = (oracle: string) => {
  return oracle.length === 42
}

export const validateOracleFunction = (functionName: string) => {
  return functionName.endsWith('()')
}

export const oraclesReady = (tokens: TokenState[]) => {
  const oracleTokens = tokens.filter((token) => token.ngAssetType === 1)
  const allValid = oracleTokens.every((token) => checkOracle(token.oracleAddress))
  const functionsValid = oracleTokens.every((token) => validateOracleFunction(token.oracleFunction))
  return allValid && functionsValid
}

export const containsOracle = (tokens: TokenState[]) => {
  return tokens.some((token) => token.ngAssetType === 1 && token.address !== '')
}

export const checkFormReady = (
  poolTypeValid: boolean,
  tokensInPoolValid: boolean,
  parametersValid: boolean,
  poolInfoValid: boolean,
) => {
  return poolTypeValid && tokensInPoolValid && parametersValid && poolInfoValid
}

export const isTricrypto = (
  tricryptoEnabled: boolean,
  tokenAmount: number,
  tokenA: TokenState,
  tokenB: TokenState,
  tokenC: TokenState,
) => {
  return (
    tricryptoEnabled && tokenAmount === 3 && tokenA.address !== '' && tokenB.address !== '' && tokenC.address !== ''
  )
}

export const checkMetaPool = (address: string, basePools: BasePool[]) => {
  return address === '' ? false : basePools.some((item) => item.token === address)
}

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
