import { useMarketVaultMaxDeposit } from '@/llamalend/queries/market'
import type { DepositForm, DepositParams } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { queryMinimum } from '@evm-ui/lib'
import type { Address } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { useFormSync } from '@ui/features/forms'
import { q } from '@ui/features/queries/util'

export function useMaxDepositTokenValues<ChainId extends LlamaChainId>({
  params,
  borrowToken,
  form,
}: {
  params: DepositParams<ChainId>
  borrowToken: Address | undefined
  form: UseFormReturn<DepositForm>
}) {
  const { chainId, marketId, userAddress } = params
  const maxUserDeposit = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: borrowToken,
  })
  const maxVaultDeposit = useMarketVaultMaxDeposit({ chainId, marketId })
  const maxDepositAmount = queryMinimum(maxUserDeposit, maxVaultDeposit)

  useFormSync(form, { maxDepositAmount: maxDepositAmount.data })

  return { ...q(maxDepositAmount), fieldName: 'maxDepositAmount' as const }
}
