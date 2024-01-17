import { CreateToken, TokenId, SelectTokenFormValues } from '@/components/PageCreatePool/types'

import { useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { uniqBy } from 'lodash'

import useStore from '@/store/useStore'
import networks from '@/networks'
import useTokensMapper from '@/hooks/useTokensMapper'

import { STABLESWAP, CRYPTOSWAP, TOKEN_A, TOKEN_B, TOKEN_C, TOKEN_D } from '@/components/PageCreatePool/constants'
import { NATIVE_TOKENS } from '@curvefi/api/lib/curve'
import { checkMetaPool, containsOracle } from '@/components/PageCreatePool/utils'

import Box from '@/ui/Box'
import Button from '@/ui/Button'
import SwitchTokensButton from '@/components/PageCreatePool/components/SwitchTokensButton'
import WarningBox from '@/components/PageCreatePool/components/WarningBox'
import SelectToken from '@/components/PageCreatePool/TokensInPool/SelectToken'
import SetOracle from '@/components/PageCreatePool/TokensInPool/SetOracle'

type Props = {
  curve: CurveApi
  haveSigner: boolean
  chainId: ChainId
}

const TokensInPool = ({ curve, chainId, haveSigner }: Props) => {
  const {
    userAddedTokens,
    poolPresetIndex,
    resetPoolPresetIndex,
    swapType,
    tokensInPool,
    updateTokensInPool,
    updateTokenAmount,
    updateSwapType,
  } = useStore((state) => state.createPool)
  const { tokenAPrice, tokenBPrice, tokenCPrice, tokenDPrice } = useStore((state) => state.createPool.initialPrice)
  const userBalances = useStore((state) => state.userBalances.userBalancesMapper)
  const { tokensMapper } = useTokensMapper(chainId)

  const ETH = NATIVE_TOKENS[chainId].address
  const BASEPOOL_COINS: string[] = networks[chainId].basePools.reduce((acc: string[], pool) => {
    return acc.concat(pool.coins)
  }, [])

  const DISABLED_TOKENS = [...BASEPOOL_COINS, ETH]

  // prepares list of tokens
  const selTokens: CreateToken[] = useMemo(() => {
    const tokensArray = Object.entries(tokensMapper).map((token) => {
      return {
        ...token[1]!,
        userAddedToken: false,
        basePool: networks[chainId].basePools.some((pool) => pool.token === token[0]),
      }
    })

    if (haveSigner && Object.keys(userBalances).length > 0 && Object.keys(tokensArray || {}).length > 0) {
      const volumeSortedTokensArray = tokensArray
        .filter((token) => token.symbol !== '' && token.address !== '')
        .sort((a, b) => Number(b.volume) - Number(a.volume))

      // adds userAddedTokens at the top of the list
      return uniqBy([...userAddedTokens, ...volumeSortedTokensArray], (o) => o.address)
    }
    const balanceSortedTokensArray = tokensArray
      .filter((token) => token.symbol !== '' && token.address !== '')
      .sort((a, b) => Number(b.volume) - Number(a.volume))

    return uniqBy([...userAddedTokens, ...balanceSortedTokensArray], (o) => o.address)
  }, [tokensMapper, haveSigner, userBalances, userAddedTokens, chainId])

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
    [tokensMapper, userAddedTokens]
  )

  // -- on token selection
  // update state, handle if the token was already selected
  //
  const handleInpChange = useCallback(
    (name: keyof SelectTokenFormValues, value: string) => {
      let updatedFormValues = {
        [TOKEN_A]: tokensInPool.tokenA,
        [TOKEN_B]: tokensInPool.tokenB,
        [TOKEN_C]: tokensInPool.tokenC,
        [TOKEN_D]: tokensInPool.tokenD,
      }

      if (name === TOKEN_A) {
        // if token b is meta token, clear token b
        if (swapType === STABLESWAP && checkMetaPool(value, chainId) && tokensInPool.metaPoolToken) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenA,
              ngAssetType: 0,
              address: value,
            },
            tokenB: {
              ...updatedFormValues.tokenB,
              address: '',
            },
          }
        } else if (value === tokensInPool.tokenB.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenB,
              address: value,
            },
            tokenB: tokensInPool.tokenA,
          }
        } else if (value === tokensInPool.tokenC.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenC,
              address: value,
            },
            tokenC: tokensInPool.tokenA,
          }
        } else if (value === tokensInPool.tokenD.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenD,
              address: value,
            },
            tokenD: tokensInPool.tokenA,
          }
          // reset token b if it exists in basepools
        } else if (
          swapType === STABLESWAP &&
          networks[chainId].basePools.some(
            (token) =>
              token.token === value &&
              BASEPOOL_COINS.some((token) => token === updatedFormValues[TOKEN_B].address.toLowerCase())
          )
        ) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenA,
              address: value,
            },
            tokenB: {
              ...updatedFormValues.tokenB,
              address: '',
            },
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenA,
              address: value,
            },
          }
        }
      }

      if (name === TOKEN_B) {
        // if token a is meta token, clear token a
        if (swapType === STABLESWAP && checkMetaPool(value, chainId) && tokensInPool.metaPoolToken) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenB: {
              ...updatedFormValues.tokenB,
              ngAssetType: 0,
              address: value,
            },
            tokenA: {
              ...updatedFormValues.tokenA,
              address: '',
            },
          }
          // tokenB handle selecting already selected token
        } else if (value === tokensInPool.tokenA.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenB: {
              ...updatedFormValues.tokenA,
              address: value,
            },
            tokenA: tokensInPool.tokenB,
          }
        } else if (value === tokensInPool.tokenC.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenB: {
              ...updatedFormValues.tokenC,
              address: value,
            },
            tokenC: tokensInPool.tokenB,
          }
        } else if (value === tokensInPool.tokenD.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenB: {
              ...updatedFormValues.tokenD,
              address: value,
            },
            tokenD: tokensInPool.tokenB,
          }
          // reset token b if it exists in basepools
        } else if (
          swapType === STABLESWAP &&
          networks[chainId].basePools.some(
            (token) =>
              token.token === value &&
              BASEPOOL_COINS.some((token) => token === updatedFormValues[TOKEN_A].address.toLowerCase())
          )
        ) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenA,
              address: '',
            },
            tokenB: {
              ...updatedFormValues.tokenB,
              address: value,
            },
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            tokenB: {
              ...updatedFormValues.tokenB,
              address: value,
            },
          }
        }
      }

      if (name === TOKEN_C) {
        // token C
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenA,
              ngAssetType: 0,
              address: value,
            },
            tokenC: {
              ...updatedFormValues.tokenC,
              address: '',
            },
          }
          // tokenC handle selecting already selected token
        } else if (value === tokensInPool.tokenA.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenC: {
              ...updatedFormValues.tokenA,
              address: value,
            },
            tokenA: tokensInPool.tokenC,
          }
        } else if (value === tokensInPool.tokenB.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenC: {
              ...updatedFormValues.tokenB,
              address: value,
            },
            tokenB: tokensInPool.tokenC,
          }
        } else if (value === tokensInPool.tokenD.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenC: {
              ...updatedFormValues.tokenD,
              address: value,
            },
            tokenD: tokensInPool.tokenC,
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            tokenC: {
              ...updatedFormValues.tokenC,
              address: value,
            },
          }
        }
      }

      // token D
      if (name === TOKEN_D) {
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenA: {
              ...updatedFormValues.tokenA,
              ngAssetType: 0,
              address: value,
            },
            tokenD: {
              ...updatedFormValues.tokenD,
              address: '',
            },
          }
          // tokenD handle selecting already selected token
        } else if (value === tokensInPool.tokenA.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenD: {
              ...updatedFormValues.tokenA,
              address: value,
            },
            tokenA: tokensInPool.tokenD,
          }
        } else if (value === tokensInPool.tokenB.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenD: {
              ...updatedFormValues.tokenB,
              address: value,
            },
            tokenB: tokensInPool.tokenD,
          }
        } else if (value === tokensInPool.tokenC.address) {
          updatedFormValues = {
            ...updatedFormValues,
            tokenD: {
              ...updatedFormValues.tokenC,
              address: value,
            },
            tokenC: tokensInPool.tokenD,
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            tokenD: {
              ...updatedFormValues.tokenD,
              address: value,
            },
          }
        }
      }

      updateTokensInPool(
        curve,
        {
          ...updatedFormValues.tokenA,
          symbol: findSymbol(updatedFormValues.tokenA.address),
        },
        {
          ...updatedFormValues.tokenB,
          symbol: findSymbol(updatedFormValues.tokenB.address),
        },
        {
          ...updatedFormValues.tokenC,
          symbol: findSymbol(updatedFormValues.tokenC.address),
        },
        {
          ...updatedFormValues.tokenD,
          symbol: findSymbol(updatedFormValues.tokenD.address),
        },
        chainId
      )
    },
    [
      tokensInPool.tokenA,
      tokensInPool.tokenB,
      tokensInPool.tokenC,
      tokensInPool.tokenD,
      tokensInPool.metaPoolToken,
      updateTokensInPool,
      curve,
      findSymbol,
      chainId,
      swapType,
      BASEPOOL_COINS,
    ]
  )

  const addToken = () => {
    // reset preset and params when going to tricrypto
    if (CRYPTOSWAP && tokensInPool.tokenAmount === 2 && poolPresetIndex !== null) {
      resetPoolPresetIndex()
    }

    updateTokenAmount(tokensInPool.tokenAmount + 1)
  }

  const removeToken = (tokenId: TokenId) => {
    // reset preset and params when going from tricrypto to twocrypto
    if (CRYPTOSWAP && tokensInPool.tokenAmount === 3 && poolPresetIndex !== null) {
      resetPoolPresetIndex()
    }

    updateTokenAmount(tokensInPool.tokenAmount - 1)
    // remove token from form values

    updateTokensInPool(
      curve,
      tokensInPool.tokenA,
      tokensInPool.tokenB,
      {
        ...tokensInPool.tokenC,
        address: tokenId === TOKEN_C ? '' : tokensInPool.tokenC.address,
        symbol: tokenId === TOKEN_C ? '' : tokensInPool.tokenC.symbol,
        ngAssetType: tokenId === TOKEN_C ? 0 : tokensInPool.tokenC.ngAssetType,
        oracleAddress: tokenId === TOKEN_C ? '' : tokensInPool.tokenC.oracleAddress,
        oracleFunction: tokenId === TOKEN_C ? '' : tokensInPool.tokenC.oracleFunction,
      },
      {
        ...tokensInPool.tokenD,
        address: tokenId === TOKEN_D ? '' : tokensInPool.tokenD.address,
        symbol: tokenId === TOKEN_D ? '' : tokensInPool.tokenD.symbol,
        ngAssetType: tokenId === TOKEN_D ? 0 : tokensInPool.tokenD.ngAssetType,
        oracleAddress: tokenId === TOKEN_D ? '' : tokensInPool.tokenD.oracleAddress,
        oracleFunction: tokenId === TOKEN_D ? '' : tokensInPool.tokenD.oracleFunction,
      },
      chainId
    )
  }

  // check if the tokens are withing 0.95 and 1.05 threshold, won't display check if coingecko returned 0 price
  const checkThreshold = useMemo(() => {
    if (
      tokensInPool.tokenA.address !== '' &&
      tokensInPool.tokenB.address !== '' &&
      tokensInPool.tokenC.address !== '' &&
      tokensInPool.tokenD.address !== '' &&
      tokenAPrice !== 0 &&
      tokenBPrice !== 0 &&
      tokenCPrice !== 0 &&
      tokenDPrice !== 0
    ) {
      const results = [
        tokenAPrice / tokenBPrice,
        tokenAPrice / tokenCPrice,
        tokenAPrice / tokenDPrice,
        tokenBPrice / tokenCPrice,
        tokenBPrice / tokenDPrice,
        tokenCPrice / tokenDPrice,
      ]

      return results.some((result) => result > 1.05 || result < 0.95)
    }
    if (
      tokensInPool.tokenA.address !== '' &&
      tokensInPool.tokenB.address !== '' &&
      tokensInPool.tokenD.address !== '' &&
      tokenAPrice !== 0 &&
      tokenBPrice !== 0 &&
      tokenDPrice !== 0
    ) {
      const results = [tokenAPrice / tokenBPrice, tokenAPrice / tokenDPrice, tokenBPrice / tokenDPrice]

      return results.some((result) => result > 1.05 || result < 0.95)
    }
    if (
      tokensInPool.tokenA.address !== '' &&
      tokensInPool.tokenB.address !== '' &&
      tokensInPool.tokenC.address !== '' &&
      tokenAPrice !== 0 &&
      tokenBPrice !== 0 &&
      tokenCPrice !== 0
    ) {
      const results = [tokenAPrice / tokenBPrice, tokenAPrice / tokenCPrice, tokenBPrice / tokenCPrice]

      return results.some((result) => result > 1.05 || result < 0.95)
    }
    if (
      tokensInPool.tokenA.address !== '' &&
      tokensInPool.tokenB.address !== '' &&
      tokenAPrice !== 0 &&
      tokenBPrice !== 0
    ) {
      const AB = tokenAPrice / tokenBPrice
      return AB > 1.05 || AB < 0.95
    }
    return false
  }, [
    tokenAPrice,
    tokenBPrice,
    tokenCPrice,
    tokenDPrice,
    tokensInPool.tokenA.address,
    tokensInPool.tokenB.address,
    tokensInPool.tokenC.address,
    tokensInPool.tokenD.address,
  ])

  return (
    <Wrapper>
      <TokenPickerWrapper>
        {/* Token A */}
        <SelectToken
          curve={curve}
          haveSigner={haveSigner}
          chainId={chainId}
          tokenId={TOKEN_A}
          token={tokensInPool.tokenA}
          tokenTitle={t`Token A`}
          disabledTokens={tokensInPool.tokenB.basePool ? DISABLED_TOKENS : [ETH]}
          selTokens={selTokens}
          handleInpChange={handleInpChange}
        />
        <SwitchWrapper
          flex
          flexJustifyContent="center"
          className={`${swapType === CRYPTOSWAP ? 'extra-margin-top' : ''}`}
        >
          <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_A} to={TOKEN_B} />
        </SwitchWrapper>
        {/* Token B */}
        <SelectToken
          curve={curve}
          haveSigner={haveSigner}
          chainId={chainId}
          tokenId={TOKEN_B}
          token={tokensInPool.tokenB}
          tokenTitle={t`Token B`}
          disabledTokens={tokensInPool.tokenA.basePool ? DISABLED_TOKENS : [ETH]}
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
              <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_B} to={TOKEN_C} />
            </SwitchWrapper>
            {/* Token C */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_C}
              token={tokensInPool.tokenC}
              tokenTitle={t`Token C`}
              disabledTokens={tokensInPool.metaPoolToken ? DISABLED_TOKENS : [ETH]}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 3 && (
          <>
            <SwitchWrapper
              flex
              flexJustifyContent="center"
              className={`${swapType === CRYPTOSWAP ? 'extra-margin-top' : ''}`}
            >
              <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_C} to={TOKEN_D} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_D}
              token={tokensInPool.tokenD}
              tokenTitle={t`Token D`}
              disabledTokens={tokensInPool.metaPoolToken ? DISABLED_TOKENS : [ETH]}
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
          {checkThreshold && networks[chainId].cryptoSwapFactory && (
            <>
              <WarningBox
                message={t`Tokens appear to be unpegged (>5% deviation from 1:1).
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
              {networks[chainId].basePools.length !== 0 && (
                <p>{t`Pools with basepools (${networks[chainId].basePools.map((pool, index) => {
                  if (index === 0) {
                    return `${pool.name}`
                  }
                  if (index === networks[chainId].basePools.length - 1) {
                    return ` ${pool.name}`
                  }
                  return ` ${pool.name}`
                })}) allow a maximum of 2 tokens`}</p>
              )}
              {!networks[chainId].stableSwapNg && (
                <p>{t`Rebasing tokens are not supported in this version of Stableswap`}</p>
              )}
            </ExplainerWrapper>
          </Row>
        </>
      ) : (
        <Row>
          <ExplainerWrapper flex flexColumn>
            <p>{t`Consider choosing the token with the higher unit price as the first token for a more performant AMM`}</p>
            <p>{t`Rebasing tokens are not supported in ${CRYPTOSWAP} pools`}</p>
          </ExplainerWrapper>
        </Row>
      )}

      <RebaseAddRow flex flexJustifyContent={'space-between'}>
        <AddButton
          onClick={addToken}
          variant="filled"
          disabled={
            (swapType === STABLESWAP && tokensInPool.tokenAmount === 4) ||
            (swapType === STABLESWAP && tokensInPool.metaPoolToken) ||
            (swapType === CRYPTOSWAP && networks[chainId].tricryptoFactory && tokensInPool.tokenAmount === 3) ||
            (swapType === CRYPTOSWAP && networks[chainId].tricryptoFactory && !networks[chainId].cryptoSwapFactory) ||
            (swapType === CRYPTOSWAP && !networks[chainId].tricryptoFactory)
          }
        >
          {t`Add token`}
        </AddButton>
      </RebaseAddRow>

      {swapType === STABLESWAP &&
        containsOracle([tokensInPool.tokenA, tokensInPool.tokenB, tokensInPool.tokenC, tokensInPool.tokenD]) && (
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

export default TokensInPool
