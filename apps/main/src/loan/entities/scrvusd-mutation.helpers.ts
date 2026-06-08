import { useConfig } from 'wagmi'
import { CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import type { Address } from '@primitives/address.utils'
import { invalidateTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { rootKeys } from '@ui-kit/lib/model'

export const invalidateScrvUsdMutationQueries = async ({
  chainId,
  config,
  userAddress,
}: {
  chainId: number
  config: ReturnType<typeof useConfig>
  userAddress: Address
}) =>
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.userBalances'],
    }),
    queryClient.invalidateQueries({
      queryKey: [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.depositIsApproved'],
    }),
    queryClient.invalidateQueries({
      queryKey: [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.depositAllowance'],
    }),
    invalidateTokenBalances(config, {
      chainId,
      userAddress,
      tokenAddresses: [CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS as Address],
    }),
  ])
