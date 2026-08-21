import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketMutation } from '@/llamalend/mutations/useMarketMutation'
import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { fetchRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { getRepayImplementation, isFullRepayFromDebtToken } from '@/llamalend/queries/repay/repay-query.helpers'
import type { RepayFormData } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { parseMutationRoute } from '@evm-ui/entities/router-api'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { waitForApproval } from '@evm-ui/utils'
import { type Address, type Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouteProvider } from '@primitives/router.utils'

type RepayMutation = {
  stateCollateral: Decimal
  userCollateral: Decimal
  userBorrowed: Decimal
  isFull: boolean
  slippage: Decimal
  routeId: string | undefined
}

type RepayOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
  leverageProviders: readonly RouteProvider[] | undefined
}

const approveRepay = async (
  market: MarketTemplate,
  { stateCollateral = '0', userCollateral = '0', userBorrowed = '0', isFull, routeId, slippage }: RepayMutation,
) => {
  if (isFullRepayFromDebtToken(isFull, stateCollateral, userCollateral)) {
    return (await getLoanImplementation(market).fullRepayApprove()) as Hex[]
  }
  const [type, impl] = getRepayImplementation(market.id, {
    userCollateral,
    stateCollateral,
    userBorrowed,
    routeId,
    slippage,
  })
  switch (type) {
    case 'zapV2':
      return (await impl.repayApprove({ userCollateral })) as Hex[]
    case 'deleverage':
      return [] // no approve needed, paying from state
    case 'unleveragedMint':
      return (await impl.repayApprove(userBorrowed)) as Hex[]
    case 'unleveragedLend':
      return (await impl.repayApprove(userBorrowed)) as Hex[]
  }
}

const repay = async (
  market: MarketTemplate,
  { stateCollateral = '0', userCollateral = '0', userBorrowed = '0', isFull, slippage, routeId }: RepayMutation,
): Promise<Hex> => {
  if (isFullRepayFromDebtToken(isFull, stateCollateral, userCollateral)) {
    return (await getLoanImplementation(market).fullRepay()) as Hex
  }
  const [type, impl] = getRepayImplementation(market, {
    userCollateral,
    stateCollateral,
    userBorrowed,
    routeId,
    slippage,
  })
  switch (type) {
    case 'zapV2':
      return (await impl.repay({
        stateCollateral,
        userCollateral,
        ...parseMutationRoute(market, { routeId, slippage, isRepay: true }),
      })) as Hex
    case 'deleverage':
      return (await impl.repay(stateCollateral, +slippage)) as Hex
    case 'unleveragedMint':
      return (await impl.repay(userBorrowed)) as Hex
    case 'unleveragedLend':
      return (await impl.repay({ debt: userBorrowed })) as Hex
  }
}

export const useRepayMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  leverageProviders,
  ...props
}: RepayOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useMarketMutation<RepayMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'repay'] as const,
    mutationFn: async (variables, { market }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchRepayIsApproved({ marketId, chainId, userAddress, ...variables }, { staleTime: 0 }),
        onApprove: async () => await approveRepay(market, variables),
        message: t`Approved repayment`,
        config,
      })
      return { hash: await repay(market, variables) }
    },
    validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: true, leverageProviders }),
    pendingMessage: (mutation, { market }) => t`Repaying loan... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Loan repaid! ${formatTokenAmounts(market, mutation)}`,
    ...props,
  })

  const onSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
    async ({ userBorrowed = '0', isFull, ...form }: RepayFormData) =>
      mutate({
        ...form,
        isFull,
        userBorrowed,
      } as RepayMutation),
    [mutate],
  )

  return { onSubmit, mutate, error, isPending }
}
