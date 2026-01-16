import lodash from 'lodash'
import { useMemo, useCallback } from 'react'
import { styled } from 'styled-components'
import { SwitchTokensButton } from '@/dex/components/PageCreatePool/components/SwitchTokensButton'
import { WarningBox } from '@/dex/components/PageCreatePool/components/WarningBox'
import {
  STABLESWAP,
  CRYPTOSWAP,
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
  FXSWAP,
  NG_ASSET_TYPE,
} from '@/dex/components/PageCreatePool/constants'
import { SelectToken } from '@/dex/components/PageCreatePool/TokensInPool/SelectToken'
import { SetOracle } from '@/dex/components/PageCreatePool/TokensInPool/SetOracle'
import { CreateToken, TokenId, TokensInPoolState } from '@/dex/components/PageCreatePool/types'
import { checkMetaPool, containsOracle, getBasepoolCoins } from '@/dex/components/PageCreatePool/utils'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import {
  DEFAULT_CREATE_POOL_STATE,
  DEFAULT_ERC4626_STATUS,
  DEFAULT_ORACLE_STATUS,
} from '@/dex/store/createCreatePoolSlice'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, ChainId, BasePool } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  curve: CurveApi
  haveSigner: boolean
  chainId: ChainId
}

const DEFAULT_POOLS: BasePool[] = []

export const TokensInPool = ({ curve, chainId, haveSigner }: Props) => {
  const userAddedTokens = useStore((state) => state.createPool.userAddedTokens)
  const poolPresetIndex = useStore((state) => state.createPool.poolPresetIndex)
  const resetPoolPresetIndex = useStore((state) => state.createPool.resetPoolPresetIndex)
  const swapType = useStore((state) => state.createPool.swapType)
  const tokensInPool = useStore((state) => state.createPool.tokensInPool)
  const initialPrice = useStore((state) => state.createPool.initialPrice)
  const updateTokensInPool = useStore((state) => state.createPool.updateTokensInPool)
  const updateTokenAmount = useStore((state) => state.createPool.updateTokenAmount)
  const updateSwapType = useStore((state) => state.createPool.updateSwapType)
  const updateNgAssetType = useStore((state) => state.createPool.updateNgAssetType)
  const basePools = useStore((state) => state.pools.basePools[chainId]) ?? DEFAULT_POOLS
  const { tokensMapper } = useTokensMapper(chainId)
  const nativeToken = curve.getNetworkConstants().NATIVE_TOKEN
  const {
    data: { createDisabledTokens, stableswapFactory, tricryptoFactory, twocryptoFactory },
  } = useNetworkByChain({ chainId })

  const NATIVE_TOKENS = useMemo(
    () => (nativeToken?.address ? [nativeToken.address, ...createDisabledTokens] : [...createDisabledTokens]),
    [nativeToken, createDisabledTokens],
  )

  // prepares list of tokens
  const selTokens: CreateToken[] = useMemo(() => {
    const tokensArray = Object.entries(tokensMapper).map((token) => ({
      ...token[1]!,
      userAddedToken: false,
      basePool: basePools.some((pool) => pool.token.toLowerCase() === token[0].toLowerCase()),
    }))

    if (haveSigner && Object.keys(tokensArray || {}).length > 0) {
      const volumeSortedTokensArray = tokensArray
        .filter((token) => token.symbol !== '' && token.address !== '')
        .sort((a, b) => Number(b.volume) - Number(a.volume))

      // adds userAddedTokens at the top of the list
      return lodash.uniqBy([...userAddedTokens, ...volumeSortedTokensArray], (o) => o.address)
    }
    const balanceSortedTokensArray = tokensArray
      .filter((token) => token.symbol !== '' && token.address !== '')
      .sort((a, b) => Number(b.volume) - Number(a.volume))

    return lodash.uniqBy([...userAddedTokens, ...balanceSortedTokensArray], (o) => o.address)
  }, [tokensMapper, haveSigner, userAddedTokens, basePools])

  const findSymbol = useCallback(
    (address: string) => {
      if (address !== '') {
        if (tokensMapper[address]) return tokensMapper[address]!.symbol
        //search through user added tokens
        const addedToken = userAddedTokens.find((userToken) => userToken.address === address)
        if (addedToken) return addedToken.symbol
      }
      return ''
    },
    [tokensMapper, userAddedTokens],
  )

  const handleInpChange = useCallback(
    (name: TokenId, value: string, tokensInPoolState: TokensInPoolState) => {
      const normalizedValue = value.toLowerCase()

      if (!normalizedValue.startsWith('0x')) return
      const previousAddress = tokensInPoolState[name].address.toLowerCase()

      if (normalizedValue === previousAddress) return

      // reset the ngAssetType to Standard by default
      updateNgAssetType(name, NG_ASSET_TYPE.STANDARD)

      const basePoolCoins: string[] = getBasepoolCoins(
        value,
        basePools,
        tokensInPoolState.tokenA,
        tokensInPoolState.tokenB,
      )

      let updatedFormValues = { ...tokensInPoolState }

      const updateTokenFormValues = (tokenId: TokenId) => {
        updatedFormValues = {
          ...updatedFormValues,
          [tokenId]: {
            ...updatedFormValues[tokenId],
            address: value,
            symbol: findSymbol(value),
            basePool: checkMetaPool(value, basePools),
          },
        }
      }

      const swapTokens = (tokenId1: TokenId, tokenId2: TokenId) => {
        updatedFormValues = {
          ...updatedFormValues,
          [tokenId1]: {
            ...updatedFormValues[tokenId2],
            address: value,
            symbol: findSymbol(value),
          },
          [tokenId2]:
            !tokensInPool[tokenId1].basePool && tokenId2 !== TOKEN_A && tokenId2 !== TOKEN_B
              ? tokensInPool[tokenId1]
              : DEFAULT_CREATE_POOL_STATE.tokensInPool[tokenId1],
        }
      }

      if (name === TOKEN_A) {
        // value = basepool while basepool selected
        if (swapType === STABLESWAP && checkMetaPool(value, basePools) && tokensInPoolState.tokenB.basePool) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              basePool: true,
            },
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: '',
            },
          }
          // value = basepool while token in basepool is selected
        } else if (
          swapType === STABLESWAP &&
          checkMetaPool(value, basePools) &&
          basePoolCoins.some((token) => token === tokensInPoolState.tokenB.address)
        ) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              symbol: findSymbol(value),
              address: value,
              basePool: true,
            },
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: '',
            },
          }
          // value = token in basepool that is already selected
        } else if (
          swapType === STABLESWAP &&
          tokensInPoolState.tokenB.basePool &&
          basePoolCoins.some((token) => token === value)
        ) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
              symbol: findSymbol(value),
            },
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: '',
              basePool: false,
            },
          }
        } else if (value === tokensInPoolState[TOKEN_B].address) {
          swapTokens(TOKEN_A, TOKEN_B)
        } else if (value === tokensInPoolState[TOKEN_C].address) {
          swapTokens(TOKEN_A, TOKEN_C)
        } else if (value === tokensInPoolState[TOKEN_D].address) {
          swapTokens(TOKEN_A, TOKEN_D)
        } else if (value === tokensInPoolState[TOKEN_E].address) {
          swapTokens(TOKEN_A, TOKEN_E)
        } else if (value === tokensInPoolState[TOKEN_F].address) {
          swapTokens(TOKEN_A, TOKEN_F)
        } else if (value === tokensInPoolState[TOKEN_G].address) {
          swapTokens(TOKEN_A, TOKEN_G)
        } else if (value === tokensInPoolState[TOKEN_H].address) {
          swapTokens(TOKEN_A, TOKEN_H)
        } else {
          updateTokenFormValues(TOKEN_A)
        }
      }

      if (name === TOKEN_B) {
        if (swapType === STABLESWAP && checkMetaPool(value, basePools) && tokensInPoolState.tokenA.basePool) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: '',
            },
          }
          // value = basepool while token in basepool is selected
        } else if (
          swapType === STABLESWAP &&
          checkMetaPool(value, basePools) &&
          basePoolCoins.some((token) => token === tokensInPoolState.tokenA.address)
        ) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: '',
            },
          }
          // value = token in basepool (eg USDT in 3crv) that is already selected
        } else if (
          swapType === STABLESWAP &&
          tokensInPoolState.tokenA.basePool &&
          basePoolCoins.some((token) => token === value)
        ) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
              symbol: findSymbol(value),
            },
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: '',
              basePool: false,
            },
          }
        } else if (value === tokensInPoolState[TOKEN_A].address) {
          swapTokens(TOKEN_B, TOKEN_A)
        } else if (value === tokensInPoolState[TOKEN_C].address) {
          swapTokens(TOKEN_B, TOKEN_C)
        } else if (value === tokensInPoolState[TOKEN_D].address) {
          swapTokens(TOKEN_B, TOKEN_D)
        } else if (value === tokensInPoolState[TOKEN_E].address) {
          swapTokens(TOKEN_B, TOKEN_E)
        } else if (value === tokensInPoolState[TOKEN_F].address) {
          swapTokens(TOKEN_B, TOKEN_F)
        } else if (value === tokensInPoolState[TOKEN_G].address) {
          swapTokens(TOKEN_B, TOKEN_G)
        } else if (value === tokensInPoolState[TOKEN_H].address) {
          swapTokens(TOKEN_B, TOKEN_H)
        } else {
          updateTokenFormValues(TOKEN_B)
        }
      }

      if (name === TOKEN_C) {
        if (swapType === STABLESWAP && checkMetaPool(value, basePools)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_C],
              address: '',
            },
          }
        } else if (value === tokensInPoolState[TOKEN_A].address) {
          swapTokens(TOKEN_C, TOKEN_A)
        } else if (value === tokensInPoolState[TOKEN_B].address) {
          swapTokens(TOKEN_C, TOKEN_B)
        } else if (value === tokensInPoolState[TOKEN_D].address) {
          swapTokens(TOKEN_C, TOKEN_D)
        } else if (value === tokensInPoolState[TOKEN_E].address) {
          swapTokens(TOKEN_C, TOKEN_E)
        } else if (value === tokensInPoolState[TOKEN_F].address) {
          swapTokens(TOKEN_C, TOKEN_F)
        } else if (value === tokensInPoolState[TOKEN_G].address) {
          swapTokens(TOKEN_C, TOKEN_G)
        } else if (value === tokensInPoolState[TOKEN_H].address) {
          swapTokens(TOKEN_C, TOKEN_H)
        } else {
          updateTokenFormValues(TOKEN_C)
        }
      }

      // token D
      if (name === TOKEN_D) {
        if (swapType === STABLESWAP && checkMetaPool(value, basePools)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_D],
              address: '',
            },
          }
        } else if (value === tokensInPoolState[TOKEN_A].address) {
          swapTokens(TOKEN_D, TOKEN_A)
        } else if (value === tokensInPoolState[TOKEN_B].address) {
          swapTokens(TOKEN_D, TOKEN_B)
        } else if (value === tokensInPoolState[TOKEN_C].address) {
          swapTokens(TOKEN_D, TOKEN_C)
        } else if (value === tokensInPoolState[TOKEN_E].address) {
          swapTokens(TOKEN_D, TOKEN_E)
        } else if (value === tokensInPoolState[TOKEN_F].address) {
          swapTokens(TOKEN_D, TOKEN_F)
        } else if (value === tokensInPoolState[TOKEN_G].address) {
          swapTokens(TOKEN_D, TOKEN_G)
        } else if (value === tokensInPoolState[TOKEN_H].address) {
          swapTokens(TOKEN_D, TOKEN_H)
        } else {
          updateTokenFormValues(TOKEN_D)
        }
      }

      // token E
      if (name === TOKEN_E) {
        if (swapType === STABLESWAP && checkMetaPool(value, basePools)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_E],
              address: '',
            },
          }
        } else if (value === tokensInPoolState[TOKEN_A].address) {
          swapTokens(TOKEN_E, TOKEN_A)
        } else if (value === tokensInPoolState[TOKEN_B].address) {
          swapTokens(TOKEN_E, TOKEN_B)
        } else if (value === tokensInPoolState[TOKEN_C].address) {
          swapTokens(TOKEN_E, TOKEN_C)
        } else if (value === tokensInPoolState[TOKEN_D].address) {
          swapTokens(TOKEN_E, TOKEN_D)
        } else if (value === tokensInPoolState[TOKEN_F].address) {
          swapTokens(TOKEN_E, TOKEN_F)
        } else if (value === tokensInPoolState[TOKEN_G].address) {
          swapTokens(TOKEN_E, TOKEN_G)
        } else if (value === tokensInPoolState[TOKEN_H].address) {
          swapTokens(TOKEN_E, TOKEN_H)
        } else {
          updateTokenFormValues(TOKEN_E)
        }
      }

      // token F
      if (name === TOKEN_F) {
        if (swapType === STABLESWAP && checkMetaPool(value, basePools)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_F],
              address: '',
            },
          }
        } else if (value === tokensInPoolState[TOKEN_A].address) {
          swapTokens(TOKEN_F, TOKEN_A)
        } else if (value === tokensInPoolState[TOKEN_B].address) {
          swapTokens(TOKEN_F, TOKEN_B)
        } else if (value === tokensInPoolState[TOKEN_C].address) {
          swapTokens(TOKEN_F, TOKEN_C)
        } else if (value === tokensInPoolState[TOKEN_D].address) {
          swapTokens(TOKEN_F, TOKEN_D)
        } else if (value === tokensInPoolState[TOKEN_E].address) {
          swapTokens(TOKEN_F, TOKEN_E)
        } else if (value === tokensInPoolState[TOKEN_G].address) {
          swapTokens(TOKEN_F, TOKEN_G)
        } else if (value === tokensInPoolState[TOKEN_H].address) {
          swapTokens(TOKEN_F, TOKEN_H)
        } else {
          updateTokenFormValues(TOKEN_F)
        }
      }

      // token G
      if (name === TOKEN_G) {
        if (swapType === STABLESWAP && checkMetaPool(value, basePools)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_G],
              address: '',
            },
          }
        } else if (value === tokensInPoolState[TOKEN_A].address) {
          swapTokens(TOKEN_G, TOKEN_A)
        } else if (value === tokensInPoolState[TOKEN_B].address) {
          swapTokens(TOKEN_G, TOKEN_B)
        } else if (value === tokensInPoolState[TOKEN_C].address) {
          swapTokens(TOKEN_G, TOKEN_C)
        } else if (value === tokensInPoolState[TOKEN_D].address) {
          swapTokens(TOKEN_G, TOKEN_D)
        } else if (value === tokensInPoolState[TOKEN_E].address) {
          swapTokens(TOKEN_G, TOKEN_E)
        } else if (value === tokensInPoolState[TOKEN_F].address) {
          swapTokens(TOKEN_G, TOKEN_F)
        } else if (value === tokensInPoolState[TOKEN_H].address) {
          swapTokens(TOKEN_G, TOKEN_H)
        } else {
          updateTokenFormValues(TOKEN_G)
        }
      }

      // token H
      if (name === TOKEN_H) {
        if (swapType === STABLESWAP && checkMetaPool(value, basePools)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: NG_ASSET_TYPE.STANDARD,
              address: value,
              symbol: findSymbol(value),
              basePool: true,
            },
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_H],
              address: '',
            },
          }
        } else if (value === tokensInPoolState[TOKEN_A].address) {
          swapTokens(TOKEN_H, TOKEN_A)
        } else if (value === tokensInPoolState[TOKEN_B].address) {
          swapTokens(TOKEN_H, TOKEN_B)
        } else if (value === tokensInPoolState[TOKEN_C].address) {
          swapTokens(TOKEN_H, TOKEN_C)
        } else if (value === tokensInPoolState[TOKEN_D].address) {
          swapTokens(TOKEN_H, TOKEN_D)
        } else if (value === tokensInPoolState[TOKEN_E].address) {
          swapTokens(TOKEN_H, TOKEN_E)
        } else if (value === tokensInPoolState[TOKEN_F].address) {
          swapTokens(TOKEN_H, TOKEN_F)
        } else if (value === tokensInPoolState[TOKEN_G].address) {
          swapTokens(TOKEN_H, TOKEN_G)
        } else {
          updateTokenFormValues(TOKEN_H)
        }
      }

      updateTokensInPool(
        curve,
        updatedFormValues[TOKEN_A],
        updatedFormValues[TOKEN_B],
        updatedFormValues[TOKEN_C],
        updatedFormValues[TOKEN_D],
        updatedFormValues[TOKEN_E],
        updatedFormValues[TOKEN_F],
        updatedFormValues[TOKEN_G],
        updatedFormValues[TOKEN_H],
      )
    },
    [tokensInPool, updateTokensInPool, curve, findSymbol, swapType, basePools, updateNgAssetType],
  )

  const addToken = useCallback(() => {
    // reset preset and params when going to tricrypto
    if (CRYPTOSWAP && tokensInPool.tokenAmount === 2 && poolPresetIndex !== null) {
      resetPoolPresetIndex()
    }

    updateTokenAmount(tokensInPool.tokenAmount + 1)
  }, [tokensInPool.tokenAmount, updateTokenAmount, poolPresetIndex, resetPoolPresetIndex])

  const removeToken = useCallback(
    (tokenId: TokenId, tokensInPoolState: TokensInPoolState) => {
      // reset preset and params when going from tricrypto to twocrypto
      if (CRYPTOSWAP && tokensInPoolState.tokenAmount === 3 && poolPresetIndex !== null) {
        resetPoolPresetIndex()
      }

      updateTokenAmount(tokensInPoolState.tokenAmount - 1)
      // remove token from form values

      const updateTokenProps = (token: TokenId) => ({
        ...tokensInPoolState[token],
        address: tokenId === token ? '' : tokensInPoolState[token].address,
        symbol: tokenId === token ? '' : tokensInPoolState[token].symbol,
        ngAssetType: tokenId === token ? NG_ASSET_TYPE.STANDARD : tokensInPoolState[token].ngAssetType,
        oracle: tokenId === token ? { ...DEFAULT_ORACLE_STATUS } : tokensInPoolState[token].oracle,
        erc4626: tokenId === token ? { ...DEFAULT_ERC4626_STATUS } : tokensInPoolState[token].erc4626,
      })

      updateTokensInPool(
        curve,
        tokensInPoolState[TOKEN_A],
        tokensInPoolState[TOKEN_B],
        updateTokenProps(TOKEN_C),
        updateTokenProps(TOKEN_D),
        updateTokenProps(TOKEN_E),
        updateTokenProps(TOKEN_F),
        updateTokenProps(TOKEN_G),
        updateTokenProps(TOKEN_H),
      )
    },
    [poolPresetIndex, updateTokenAmount, updateTokensInPool, curve, resetPoolPresetIndex],
  )

  // check if the tokens are withing 0.95 and 1.05 threshold
  const checkStableswapThreshold = useMemo(() => {
    // Array of token IDs you want to check
    const tokenIds: TokenId[] = [TOKEN_A, TOKEN_B, TOKEN_C, TOKEN_D, TOKEN_E, TOKEN_F, TOKEN_G, TOKEN_H]

    // Filter out tokens with empty addresses or zero initial price
    const validTokens = tokenIds.filter(
      (tokenId) => tokensInPool[tokenId].address !== '' && initialPrice[tokenId] !== 0,
    )

    // Skip threshold check for tokens with special asset types (they have their own rate mechanisms)
    const hasSpecialAssetType = tokenIds.some((tokenId) => {
      const assetType = tokensInPool[tokenId].ngAssetType
      return (
        assetType === NG_ASSET_TYPE.ERC4626 ||
        assetType === NG_ASSET_TYPE.ORACLE ||
        assetType === NG_ASSET_TYPE.REBASING
      )
    })
    if (hasSpecialAssetType) return false

    if (validTokens.length <= 1) {
      // Not enough tokens for comparison
      return false
    }

    // Generate all unique pairs of valid tokens for comparison
    const pairs = []
    for (let i = 0; i < validTokens.length; i++) {
      for (let j = i + 1; j < validTokens.length; j++) {
        pairs.push([validTokens[i], validTokens[j]])
      }
    }

    // Check if any pair is outside the threshold
    return pairs.some(([tokenId1, tokenId2]) => {
      const ratio = initialPrice[tokenId1] / initialPrice[tokenId2]
      return ratio > 1.05 || ratio < 0.95
    })
  }, [initialPrice, tokensInPool])

  return (
    <Wrapper>
      <TokenPickerWrapper>
        {/* Token A */}
        <SelectToken
          curve={curve}
          haveSigner={haveSigner}
          chainId={chainId}
          tokenId={TOKEN_A}
          token={tokensInPool[TOKEN_A]}
          tokenTitle={t`Token A`}
          disabledTokens={NATIVE_TOKENS}
          selTokens={selTokens}
          handleInpChange={handleInpChange}
        />
        <SwitchWrapper
          flex
          flexJustifyContent="center"
          className={`${swapType === CRYPTOSWAP ? 'extra-margin-top' : ''}`}
        >
          <SwitchTokensButton curve={curve} from={TOKEN_A} to={TOKEN_B} />
        </SwitchWrapper>
        {/* Token B */}
        <SelectToken
          curve={curve}
          haveSigner={haveSigner}
          chainId={chainId}
          tokenId={TOKEN_B}
          token={tokensInPool[TOKEN_B]}
          tokenTitle={t`Token B`}
          disabledTokens={NATIVE_TOKENS}
          selTokens={selTokens}
          handleInpChange={handleInpChange}
        />
        {tokensInPool.tokenAmount > 2 && (
          <>
            <SwitchWrapper
              flex
              flexJustifyContent="center"
              className={`${swapType === CRYPTOSWAP ? 'extra-margin-top' : ''}`}
            >
              <SwitchTokensButton curve={curve} from={TOKEN_B} to={TOKEN_C} />
            </SwitchWrapper>
            {/* Token C */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_C}
              token={tokensInPool[TOKEN_C]}
              tokenTitle={t`Token C`}
              disabledTokens={NATIVE_TOKENS}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 3 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} from={TOKEN_C} to={TOKEN_D} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_D}
              token={tokensInPool[TOKEN_D]}
              tokenTitle={t`Token D`}
              disabledTokens={NATIVE_TOKENS}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 4 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} from={TOKEN_D} to={TOKEN_E} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_E}
              token={tokensInPool[TOKEN_E]}
              tokenTitle={t`Token E`}
              disabledTokens={NATIVE_TOKENS}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 5 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} from={TOKEN_E} to={TOKEN_F} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_F}
              token={tokensInPool[TOKEN_F]}
              tokenTitle={t`Token F`}
              disabledTokens={NATIVE_TOKENS}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 6 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} from={TOKEN_F} to={TOKEN_G} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_G}
              token={tokensInPool[TOKEN_G]}
              tokenTitle={t`Token G`}
              disabledTokens={NATIVE_TOKENS}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 7 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} from={TOKEN_G} to={TOKEN_H} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_H}
              token={tokensInPool[TOKEN_H]}
              tokenTitle={t`Token H`}
              disabledTokens={NATIVE_TOKENS}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
      </TokenPickerWrapper>
      {!chainId && <WarningBox message={t`Please connect a wallet to select tokens`} />}
      {swapType === STABLESWAP ? (
        <>
          {checkStableswapThreshold && twocryptoFactory && (
            <>
              <WarningBox
                message={t`Tokens appear to be unpegged (above 5% deviation from 1:1).
                Consider using Cryptoswap instead.`}
              >
                <SwitchModeButton
                  variant="text"
                  onClick={() => updateSwapType(CRYPTOSWAP, chainId)}
                >{t`(Switch)`}</SwitchModeButton>
              </WarningBox>
            </>
          )}
          <Row>
            <ExplainerWrapper flex flexColumn>
              {stableswapFactory && <p>{t`Stableswap pools allow up to 8 tokens`}</p>}
              {basePools.length !== 0 && <p>{t`Pools with basepools allow a maximum of 2 tokens`}</p>}
              {!stableswapFactory && <p>{t`Rebasing tokens are not supported in this version of Stableswap`}</p>}
            </ExplainerWrapper>
          </Row>
        </>
      ) : (
        <Row>
          <ExplainerWrapper flex flexColumn>
            <p>{t`Rebasing tokens are not supported in ${swapType} pools`}</p>
          </ExplainerWrapper>
        </Row>
      )}

      <RebaseAddRow flex flexColumn flexAlignItems="end" flexJustifyContent="end">
        <AddButton
          onClick={addToken}
          variant="filled"
          disabled={
            swapType === FXSWAP ||
            (swapType === STABLESWAP && stableswapFactory && tokensInPool.tokenAmount === 8) ||
            (swapType === STABLESWAP && !stableswapFactory && tokensInPool.tokenAmount === 4) ||
            (swapType === STABLESWAP && tokensInPool.metaPoolToken) ||
            (swapType === CRYPTOSWAP && tricryptoFactory && tokensInPool.tokenAmount === 3) ||
            (swapType === CRYPTOSWAP && tricryptoFactory && !twocryptoFactory) ||
            (swapType === CRYPTOSWAP && !tricryptoFactory)
          }
        >
          {t`Add token`}
        </AddButton>
      </RebaseAddRow>

      {swapType === STABLESWAP &&
        containsOracle([tokensInPool.tokenA, tokensInPool[TOKEN_B], tokensInPool[TOKEN_C], tokensInPool[TOKEN_D]]) && (
          <SetOracle />
        )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  padding: var(--spacing-narrow) var(--spacing-normal) var(--spacing-wide);
  margin-bottom: var(--spacing-normal);
  min-height: 380px;
`

const TokenPickerWrapper = styled(Box)`
  margin-bottom: var(--spacing-4);
`

const Row = styled(Box)``

const RebaseAddRow = styled(Row)`
  @media (min-width: 33.75rem) {
    margin: 0 var(--spacing-normal);
  }
`

const SwitchModeButton = styled(Button)`
  color: var(--button--background-color);
  background: none;
  &:hover:not(:disabled) {
    color: var(--button_filled-hover-contrast--background-color);
  }
`

const ExplainerWrapper = styled(Box)`
  margin-bottom: var(--spacing-3);
  margin-left: var(--spacing-2);
  color: var(--box--primary--color);
  p {
    font-size: var(--font-size-1);
    font-style: italic;
    margin-bottom: var(--spacing-2);
    &:last-child {
      margin-bottom: 0;
    }
  }
`

const AddButton = styled(Button)`
  padding-left: var(--spacing-normal);
  padding-right: var(--spacing-normal);
  margin: auto 0 auto auto;
`

const SwitchWrapper = styled(Box)`
  &.extra-margin-top {
    margin-top: var(--spacing-4);
  }
`
