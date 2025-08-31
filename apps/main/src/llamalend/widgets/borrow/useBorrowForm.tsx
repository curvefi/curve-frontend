import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useBalance } from 'wagmi'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { vestResolver } from '@hookform/resolvers/vest'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { type Address, CRVUSD_ADDRESS } from '@ui-kit/utils'
import { type BorrowForm, type BorrowFormQueryParams, DEFAULT_RANGE_SIMPLE_MODE } from './borrow.types'
import { useMaxBorrowReceive } from './queries/borrow-max-receive.query'
import { borrowFormValidationSuite } from './queries/borrow.validation'

type UseBorrowFormParams = {
  chainId: IChainId
  market: MintMarketTemplate | LendMarketTemplate
  network: NetworkEnum
}

const getTokens = (market: MintMarketTemplate | LendMarketTemplate, chain: NetworkEnum) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          chain,
          symbol: market.collateralSymbol,
          address: market.collateral,
          decimals: market.collateralDecimals,
        },
        borrowToken: {
          chain,
          symbol: 'crvUSD',
          address: CRVUSD_ADDRESS,
          decimals: 18,
        },
      }
    : {
        collateralToken: {
          chain,
          symbol: market.collateral_token.symbol,
          address: market.collateral_token.address,
          decimals: market.collateral_token.decimals,
        },
        borrowToken: {
          chain,
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address,
          decimals: market.borrowed_token.decimals,
        },
      }

export function useBorrowForm({ market, chainId, network: chain }: UseBorrowFormParams) {
  const { address: address } = useAccount()
  const form = useForm<BorrowForm>({
    ...formDefaultOptions,
    resolver: vestResolver(borrowFormValidationSuite),
    defaultValues: {
      userBorrowed: 0,
      userCollateral: undefined,
      debt: undefined,
      range: DEFAULT_RANGE_SIMPLE_MODE,
    },
  })

  const onSubmit = useCallback((data: BorrowForm) => {
    console.log('TODO: create mutation query', data)
  }, [])

  const isPending = form.formState.isSubmitting
  const values = form.getValues()
  const params: BorrowFormQueryParams = { chainId, poolId: market.id, ...values }
  if (!params.range) console.trace('no range set', { params, values })
  const tokens = getTokens(market, chain)
  const collateralBalance = useBalance({
    address,
    token: tokens.collateralToken.address as Address,
    chainId,
  })
  return {
    form,
    values,
    params,
    isPending: isPending,
    onSubmit: form.handleSubmit(onSubmit),
    maxBorrow: useMaxBorrowReceive(params),
    collateralBalance: collateralBalance?.data ? +collateralBalance.data.formatted : undefined,
    ...tokens,
  }
}
