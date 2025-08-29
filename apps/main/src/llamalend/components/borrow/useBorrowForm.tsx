import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useMaxBorrowReceive } from '@/llamalend/components/borrow/max-receive-borrow.query'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { vestResolver } from '@hookform/resolvers/vest'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { type Address, CRVUSD_ADDRESS } from '@ui-kit/utils'
import type { BorrowForm } from './borrow.types'
import { borrowFormValidationSuite } from './borrow.validation'

type UseBorrowFormParams = {
  chainId: IChainId
  userAddress: Address | undefined
  market: MintMarketTemplate | LendMarketTemplate
  network: NetworkEnum
}

export function useBorrowForm({ market, userAddress, chainId, network: chain }: UseBorrowFormParams) {
  const form = useForm<BorrowForm>({
    ...formDefaultOptions,
    resolver: vestResolver(borrowFormValidationSuite),
    defaultValues: {
      userBorrowed: undefined,
      userCollateral: undefined,
      range: 10, // default range value for simple mode
    },
  })

  const onSubmit = useCallback((data: BorrowForm) => {
    console.log('TODO: create mutation query', data)
  }, [])

  const isPending = form.formState.isSubmitting
  const values = form.getValues()
  return {
    form,
    values,
    isPending: isPending,
    onSubmit: form.handleSubmit(onSubmit),
    maxBorrow: useMaxBorrowReceive({ userAddress, chainId, poolId: market.id, ...values }),
    ...(market instanceof MintMarketTemplate
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
        }),
  }
}
