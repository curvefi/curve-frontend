import { CreateToken, TokenId, SelectTokenFormValues } from '@/components/PageCreatePool/types'

import { useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { uniqBy } from 'lodash'

import useStore from '@/store/useStore'
import networks from '@/networks'
import useTokensMapper from '@/hooks/useTokensMapper'

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
} from '@/components/PageCreatePool/constants'
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
    initialPrice,
    updateTokensInPool,
    updateTokenAmount,
    updateSwapType,
  } = useStore((state) => state.createPool)
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
        [TOKEN_A]: tokensInPool[TOKEN_A],
        [TOKEN_B]: tokensInPool[TOKEN_B],
        [TOKEN_C]: tokensInPool[TOKEN_C],
        [TOKEN_D]: tokensInPool[TOKEN_D],
        [TOKEN_E]: tokensInPool[TOKEN_E],
        [TOKEN_F]: tokensInPool[TOKEN_F],
        [TOKEN_G]: tokensInPool[TOKEN_G],
        [TOKEN_H]: tokensInPool[TOKEN_H],
      }

      if (name === TOKEN_A) {
        // if token b is meta token, clear token b
        if (swapType === STABLESWAP && checkMetaPool(value, chainId) && tokensInPool.metaPoolToken) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: 0,
              address: value,
              symbol: findSymbol(value),
            },
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: '',
            },
          }
        } else if (value === tokensInPool[TOKEN_B].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
            [TOKEN_B]: tokensInPool[TOKEN_A],
          }
        } else if (value === tokensInPool[TOKEN_C].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
            },
            [TOKEN_C]: tokensInPool[TOKEN_A],
          }
        } else if (value === tokensInPool[TOKEN_D].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
            },
            [TOKEN_D]: tokensInPool[TOKEN_A],
          }
        } else if (value === tokensInPool[TOKEN_E].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
            },
            [TOKEN_E]: tokensInPool[TOKEN_A],
          }
        } else if (value === tokensInPool[TOKEN_F].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
            },
            [TOKEN_F]: tokensInPool[TOKEN_A],
          }
        } else if (value === tokensInPool[TOKEN_G].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
            },
            [TOKEN_G]: tokensInPool[TOKEN_A],
          }
        } else if (value === tokensInPool[TOKEN_H].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
            },
            [TOKEN_H]: tokensInPool[TOKEN_A],
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
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: '',
            },
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
              symbol: findSymbol(value),
            },
          }
        }
      }

      if (name === TOKEN_B) {
        // if token a is meta token, clear token a
        if (swapType === STABLESWAP && checkMetaPool(value, chainId) && tokensInPool.metaPoolToken) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              ngAssetType: 0,
              address: value,
            },
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: '',
            },
          }
          // [TOKEN_B] handle selecting already selected token
        } else if (value === tokensInPool[TOKEN_A].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_A]: tokensInPool[TOKEN_B],
          }
        } else if (value === tokensInPool[TOKEN_C].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
            },
            [TOKEN_C]: tokensInPool[TOKEN_B],
          }
        } else if (value === tokensInPool[TOKEN_D].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
            },
            [TOKEN_D]: tokensInPool[TOKEN_B],
          }
        } else if (value === tokensInPool[TOKEN_E].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
            },
            [TOKEN_E]: tokensInPool[TOKEN_B],
          }
        } else if (value === tokensInPool[TOKEN_F].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
            },
            [TOKEN_F]: tokensInPool[TOKEN_B],
          }
        } else if (value === tokensInPool[TOKEN_G].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
            },
            [TOKEN_G]: tokensInPool[TOKEN_B],
          }
        } else if (value === tokensInPool[TOKEN_H].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
            },
            [TOKEN_H]: tokensInPool[TOKEN_B],
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
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              address: '',
            },
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_B]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
              symbol: findSymbol(value),
            },
          }
        }
      }

      if (name === TOKEN_C) {
        // token C
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: 0,
              address: value,
            },
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_C],
              address: '',
            },
          }
          // [TOKEN_C] handle selecting already selected token
        } else if (value === tokensInPool[TOKEN_A].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_A]: tokensInPool[TOKEN_C],
          }
        } else if (value === tokensInPool[TOKEN_B].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
            [TOKEN_B]: tokensInPool[TOKEN_C],
          }
        } else if (value === tokensInPool[TOKEN_D].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
            },
            [TOKEN_D]: tokensInPool[TOKEN_C],
          }
        } else if (value === tokensInPool[TOKEN_E].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
            },
            [TOKEN_E]: tokensInPool[TOKEN_C],
          }
        } else if (value === tokensInPool[TOKEN_F].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
            },
            [TOKEN_F]: tokensInPool[TOKEN_C],
          }
        } else if (value === tokensInPool[TOKEN_G].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
            },
            [TOKEN_G]: tokensInPool[TOKEN_C],
          }
        } else if (value === tokensInPool[TOKEN_H].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
            },
            [TOKEN_H]: tokensInPool[TOKEN_C],
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_C]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
              symbol: findSymbol(value),
            },
          }
        }
      }

      // token D
      if (name === TOKEN_D) {
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: 0,
              address: value,
            },
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_D],
              address: '',
            },
          }
          // [TOKEN_D] handle selecting already selected token
        } else if (value === tokensInPool[TOKEN_A].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_A]: tokensInPool[TOKEN_D],
          }
        } else if (value === tokensInPool[TOKEN_B].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
            [TOKEN_B]: tokensInPool[TOKEN_D],
          }
        } else if (value === tokensInPool[TOKEN_C].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
            },
            [TOKEN_C]: tokensInPool[TOKEN_D],
          }
        } else if (value === tokensInPool[TOKEN_E].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
            },
            [TOKEN_E]: tokensInPool[TOKEN_D],
          }
        } else if (value === tokensInPool[TOKEN_F].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
            },
            [TOKEN_F]: tokensInPool[TOKEN_D],
          }
        } else if (value === tokensInPool[TOKEN_G].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
            },
            [TOKEN_G]: tokensInPool[TOKEN_D],
          }
        } else if (value === tokensInPool[TOKEN_H].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
            },
            [TOKEN_H]: tokensInPool[TOKEN_D],
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_D]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
              symbol: findSymbol(value),
            },
          }
        }
      }

      // token E
      if (name === TOKEN_E) {
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: 0,
              address: value,
            },
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_E],
              address: '',
            },
          }
          // [TOKEN_E] handle selecting already selected token
        } else if (value === tokensInPool[TOKEN_A].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_A]: tokensInPool[TOKEN_E],
          }
        } else if (value === tokensInPool[TOKEN_B].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
            [TOKEN_B]: tokensInPool[TOKEN_E],
          }
        } else if (value === tokensInPool[TOKEN_C].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
            },
            [TOKEN_C]: tokensInPool[TOKEN_E],
          }
        } else if (value === tokensInPool[TOKEN_D].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
            },
            [TOKEN_D]: tokensInPool[TOKEN_E],
          }
        } else if (value === tokensInPool[TOKEN_F].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
            },
            [TOKEN_F]: tokensInPool[TOKEN_E],
          }
        } else if (value === tokensInPool[TOKEN_G].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
            },
            [TOKEN_G]: tokensInPool[TOKEN_E],
          }
        } else if (value === tokensInPool[TOKEN_H].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
            },
            [TOKEN_H]: tokensInPool[TOKEN_E],
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_E]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
              symbol: findSymbol(value),
            },
          }
        }
      }

      // token F
      if (name === TOKEN_F) {
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: 0,
              address: value,
            },
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_F],
              address: '',
            },
          }
          // [TOKEN_F] handle selecting already selected token
        } else if (value === tokensInPool[TOKEN_A].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_A]: tokensInPool[TOKEN_F],
          }
        } else if (value === tokensInPool[TOKEN_B].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
            [TOKEN_B]: tokensInPool[TOKEN_F],
          }
        } else if (value === tokensInPool[TOKEN_C].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
            },
            [TOKEN_C]: tokensInPool[TOKEN_F],
          }
        } else if (value === tokensInPool[TOKEN_D].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
            },
            [TOKEN_D]: tokensInPool[TOKEN_F],
          }
        } else if (value === tokensInPool[TOKEN_E].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
            },
            [TOKEN_E]: tokensInPool[TOKEN_F],
          }
        } else if (value === tokensInPool[TOKEN_G].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
            },
            [TOKEN_G]: tokensInPool[TOKEN_F],
          }
        } else if (value === tokensInPool[TOKEN_H].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
            },
            [TOKEN_H]: tokensInPool[TOKEN_F],
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_F]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
              symbol: findSymbol(value),
            },
          }
        }
      }

      // token G
      if (name === TOKEN_G) {
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: 0,
              address: value,
            },
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_G],
              address: '',
            },
          }
          // [TOKEN_G] handle selecting already selected token
        } else if (value === tokensInPool[TOKEN_A].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_A]: tokensInPool[TOKEN_G],
          }
        } else if (value === tokensInPool[TOKEN_B].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
            [TOKEN_B]: tokensInPool[TOKEN_G],
          }
        } else if (value === tokensInPool[TOKEN_C].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
            },
            [TOKEN_C]: tokensInPool[TOKEN_G],
          }
        } else if (value === tokensInPool[TOKEN_D].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
            },
            [TOKEN_D]: tokensInPool[TOKEN_G],
          }
        } else if (value === tokensInPool[TOKEN_E].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
            },
            [TOKEN_E]: tokensInPool[TOKEN_G],
          }
        } else if (value === tokensInPool[TOKEN_F].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
            },
            [TOKEN_F]: tokensInPool[TOKEN_G],
          }
        } else if (value === tokensInPool[TOKEN_H].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
            },
            [TOKEN_H]: tokensInPool[TOKEN_G],
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_G]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
              symbol: findSymbol(value),
            },
          }
        }
      }

      // token H
      if (name === TOKEN_H) {
        if (swapType === STABLESWAP && checkMetaPool(value, chainId)) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_A]: {
              ...updatedFormValues[TOKEN_A],
              ngAssetType: 0,
              address: value,
            },
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_H],
              address: '',
            },
          }
          // [TOKEN_H] handle selecting already selected token
        } else if (value === tokensInPool[TOKEN_A].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_A],
              address: value,
            },
            [TOKEN_A]: tokensInPool[TOKEN_H],
          }
        } else if (value === tokensInPool[TOKEN_B].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_B],
              address: value,
            },
            [TOKEN_B]: tokensInPool[TOKEN_H],
          }
        } else if (value === tokensInPool[TOKEN_C].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_C],
              address: value,
            },
            [TOKEN_C]: tokensInPool[TOKEN_H],
          }
        } else if (value === tokensInPool[TOKEN_D].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_D],
              address: value,
            },
            [TOKEN_D]: tokensInPool[TOKEN_H],
          }
        } else if (value === tokensInPool[TOKEN_E].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_E],
              address: value,
            },
            [TOKEN_E]: tokensInPool[TOKEN_H],
          }
        } else if (value === tokensInPool[TOKEN_F].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_F],
              address: value,
            },
            [TOKEN_F]: tokensInPool[TOKEN_H],
          }
        } else if (value === tokensInPool[TOKEN_G].address) {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_G],
              address: value,
            },
            [TOKEN_G]: tokensInPool[TOKEN_H],
          }
        } else {
          updatedFormValues = {
            ...updatedFormValues,
            [TOKEN_H]: {
              ...updatedFormValues[TOKEN_H],
              address: value,
              symbol: findSymbol(value),
            },
          }
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
        chainId
      )
    },
    [tokensInPool, updateTokensInPool, curve, findSymbol, chainId, swapType, BASEPOOL_COINS]
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
      tokensInPool[TOKEN_A],
      tokensInPool[TOKEN_B],
      {
        ...tokensInPool[TOKEN_C],
        address: tokenId === TOKEN_C ? '' : tokensInPool[TOKEN_C].address,
        symbol: tokenId === TOKEN_C ? '' : tokensInPool[TOKEN_C].symbol,
        ngAssetType: tokenId === TOKEN_C ? 0 : tokensInPool[TOKEN_C].ngAssetType,
        oracleAddress: tokenId === TOKEN_C ? '' : tokensInPool[TOKEN_C].oracleAddress,
        oracleFunction: tokenId === TOKEN_C ? '' : tokensInPool[TOKEN_C].oracleFunction,
      },
      {
        ...tokensInPool[TOKEN_D],
        address: tokenId === TOKEN_D ? '' : tokensInPool[TOKEN_D].address,
        symbol: tokenId === TOKEN_D ? '' : tokensInPool[TOKEN_D].symbol,
        ngAssetType: tokenId === TOKEN_D ? 0 : tokensInPool[TOKEN_D].ngAssetType,
        oracleAddress: tokenId === TOKEN_D ? '' : tokensInPool[TOKEN_D].oracleAddress,
        oracleFunction: tokenId === TOKEN_D ? '' : tokensInPool[TOKEN_D].oracleFunction,
      },
      {
        ...tokensInPool[TOKEN_E],
        address: tokenId === TOKEN_E ? '' : tokensInPool[TOKEN_E].address,
        symbol: tokenId === TOKEN_E ? '' : tokensInPool[TOKEN_E].symbol,
        ngAssetType: tokenId === TOKEN_E ? 0 : tokensInPool[TOKEN_E].ngAssetType,
        oracleAddress: tokenId === TOKEN_E ? '' : tokensInPool[TOKEN_E].oracleAddress,
        oracleFunction: tokenId === TOKEN_E ? '' : tokensInPool[TOKEN_E].oracleFunction,
      },
      {
        ...tokensInPool[TOKEN_F],
        address: tokenId === TOKEN_F ? '' : tokensInPool[TOKEN_F].address,
        symbol: tokenId === TOKEN_F ? '' : tokensInPool[TOKEN_F].symbol,
        ngAssetType: tokenId === TOKEN_F ? 0 : tokensInPool[TOKEN_F].ngAssetType,
        oracleAddress: tokenId === TOKEN_F ? '' : tokensInPool[TOKEN_F].oracleAddress,
        oracleFunction: tokenId === TOKEN_F ? '' : tokensInPool[TOKEN_F].oracleFunction,
      },
      {
        ...tokensInPool[TOKEN_G],
        address: tokenId === TOKEN_G ? '' : tokensInPool[TOKEN_G].address,
        symbol: tokenId === TOKEN_G ? '' : tokensInPool[TOKEN_G].symbol,
        ngAssetType: tokenId === TOKEN_G ? 0 : tokensInPool[TOKEN_G].ngAssetType,
        oracleAddress: tokenId === TOKEN_G ? '' : tokensInPool[TOKEN_G].oracleAddress,
        oracleFunction: tokenId === TOKEN_G ? '' : tokensInPool[TOKEN_G].oracleFunction,
      },
      {
        ...tokensInPool[TOKEN_H],
        address: tokenId === TOKEN_H ? '' : tokensInPool[TOKEN_H].address,
        symbol: tokenId === TOKEN_H ? '' : tokensInPool[TOKEN_H].symbol,
        ngAssetType: tokenId === TOKEN_H ? 0 : tokensInPool[TOKEN_H].ngAssetType,
        oracleAddress: tokenId === TOKEN_H ? '' : tokensInPool[TOKEN_H].oracleAddress,
        oracleFunction: tokenId === TOKEN_H ? '' : tokensInPool[TOKEN_H].oracleFunction,
      },
      chainId
    )
  }

  // check if the tokens are withing 0.95 and 1.05 threshold
  const checkThreshold = useMemo(() => {
    // Array of token IDs you want to check
    const tokenIds: TokenId[] = [TOKEN_A, TOKEN_B, TOKEN_C, TOKEN_D, TOKEN_E, TOKEN_F, TOKEN_G, TOKEN_H]

    // Filter out tokens with empty addresses or zero initial price
    const validTokens = tokenIds.filter(
      (tokenId) => tokensInPool[tokenId].address !== '' && initialPrice[tokenId] !== 0
    )

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
          disabledTokens={tokensInPool[TOKEN_B].basePool ? DISABLED_TOKENS : [ETH]}
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
          token={tokensInPool[TOKEN_B]}
          tokenTitle={t`Token B`}
          disabledTokens={tokensInPool[TOKEN_A].basePool ? DISABLED_TOKENS : [ETH]}
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
              token={tokensInPool[TOKEN_C]}
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
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_C} to={TOKEN_D} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_D}
              token={tokensInPool[TOKEN_D]}
              tokenTitle={t`Token D`}
              disabledTokens={tokensInPool.metaPoolToken ? DISABLED_TOKENS : [ETH]}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 4 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_D} to={TOKEN_E} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_E}
              token={tokensInPool[TOKEN_E]}
              tokenTitle={t`Token E`}
              disabledTokens={tokensInPool.metaPoolToken ? DISABLED_TOKENS : [ETH]}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 5 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_E} to={TOKEN_F} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_F}
              token={tokensInPool[TOKEN_F]}
              tokenTitle={t`Token F`}
              disabledTokens={tokensInPool.metaPoolToken ? DISABLED_TOKENS : [ETH]}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 6 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_F} to={TOKEN_G} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_G}
              token={tokensInPool[TOKEN_G]}
              tokenTitle={t`Token G`}
              disabledTokens={tokensInPool.metaPoolToken ? DISABLED_TOKENS : [ETH]}
              selTokens={selTokens}
              handleInpChange={handleInpChange}
              removeToken={removeToken}
            />
          </>
        )}
        {tokensInPool.tokenAmount > 7 && (
          <>
            <SwitchWrapper flex flexJustifyContent="center">
              <SwitchTokensButton curve={curve} chainId={chainId} from={TOKEN_G} to={TOKEN_H} />
            </SwitchWrapper>
            {/* Token D */}
            <SelectToken
              curve={curve}
              haveSigner={haveSigner}
              chainId={chainId}
              tokenId={TOKEN_H}
              token={tokensInPool[TOKEN_H]}
              tokenTitle={t`Token H`}
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
            (swapType === STABLESWAP && networks[chainId].stableSwapNg && tokensInPool.tokenAmount === 8) ||
            (swapType === STABLESWAP && !networks[chainId].stableSwapNg && tokensInPool.tokenAmount === 4) ||
            (swapType === STABLESWAP && tokensInPool.metaPoolToken) ||
            (swapType === CRYPTOSWAP && networks[chainId].tricryptoFactory && tokensInPool.tokenAmount === 3) ||
            (swapType === CRYPTOSWAP &&
              networks[chainId].tricryptoFactory &&
              !networks[chainId].cryptoSwapFactory &&
              !networks[chainId].twocryptoFactory) ||
            (swapType === CRYPTOSWAP && !networks[chainId].tricryptoFactory)
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

export default TokensInPool
