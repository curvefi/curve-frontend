import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { type BorrowForm, BorrowPreset, type LlamaMarketTemplate } from './borrow.types'
import { BORROW_PRESET_RANGES, DEFAULT_SLIPPAGE } from './borrow.util'
import { useMaxBorrowReceive } from './queries/borrow-max-receive.query'
import { useCreateLoan } from './queries/borrow.mutation'
import { borrowFormValidationSuite } from './queries/borrow.validation'
import { useUserBalances } from './queries/user-balances.query'

type UseBorrowFormParams = {
  market: LlamaMarketTemplate
  network: BaseConfig<NetworkEnum, IChainId>
  preset: BorrowPreset
}

const getTokens = (market: LlamaMarketTemplate, chain: NetworkEnum) =>
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

export function useBorrowForm({ market, network: { id: chain, chainId }, preset }: UseBorrowFormParams) {
  const { address: userAddress } = useAccount()
  const form = useForm<BorrowForm>({
    ...formDefaultOptions,
    resolver: vestResolver(borrowFormValidationSuite),
    defaultValues: {
      userCollateral: undefined,
      userBorrowed: 0,
      debt: undefined,
      leverage: undefined,
      slippage: DEFAULT_SLIPPAGE,
      range: BORROW_PRESET_RANGES[preset],
    },
  })
  const values = form.watch()
  const params = { chainId, poolId: market.id, userAddress, ...values }
  const {
    onSubmit,
    isPending: isCreating,
    isSuccess: isCreated,
    error: creationError,
    txHash,
  } = useCreateLoan({ chainId, poolId: market.id, reset: form.reset })
  const { borrowToken, collateralToken } = useMemo(() => getTokens(market, chain), [market, chain])
  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isCreating,
    onSubmit: form.handleSubmit(onSubmit),
    maxBorrow: useMaxBorrowReceive(params),
    balances: useUserBalances(params),
    borrowToken,
    collateralToken,
    isCreated,
    creationError,
    txHash,
  }
}
