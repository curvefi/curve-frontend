import { useMarketVaultMaxDeposit } from '@/llamalend/queries/market'
import type { DepositForm, DepositParams } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui-kit/forms'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useQueryMinimum } from '@ui-kit/lib'
import { useFormSync } from '@ui-kit/utils/react-form.utils'

export function useMaxDepositTokenValues<ChainId extends LlamaChainId>(
  {
    params,
    borrowToken,
    form,
  }: {
    params: DepositParams<ChainId>
    borrowToken: Address | undefined
    form: UseFormReturn<DepositForm>
  },
  enabled?: boolean,
) {
  const { chainId, marketId, userAddress } = params
  const maxUserDeposit = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: borrowToken,
  })
  const maxVaultDeposit = useMarketVaultMaxDeposit({ chainId, marketId }, enabled)
  const maxDepositAmount = useQueryMinimum(maxUserDeposit, maxVaultDeposit)

  useFormSync(form, { maxDepositAmount: maxDepositAmount.data })

  return maxDepositAmount
}
