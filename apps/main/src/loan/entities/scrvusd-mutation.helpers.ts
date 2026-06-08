import { useConfig } from 'wagmi'
import { CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { invalidateScrvUsdDepositAllowance } from '@/loan/entities/scrvusd-deposit-allowance.query'
import { invalidateScrvUsdDepositIsApproved } from '@/loan/entities/scrvusd-deposit-approved.query'
import { invalidateScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import type { ChainId } from '@/loan/types/loan.types'
import type { Address } from '@primitives/address.utils'
import { invalidateTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import type { UserChainParams } from '@ui-kit/lib/model'

export const invalidateScrvUsdMutationQueries = async ({
  chainId,
  config,
  userAddress,
}: {
  config: ReturnType<typeof useConfig>
} & UserChainParams<ChainId>) =>
  await Promise.all([
    invalidateScrvUsdUserBalances({ chainId, userAddress }),
    invalidateScrvUsdDepositIsApproved({ chainId, userAddress }),
    invalidateScrvUsdDepositAllowance({ chainId, userAddress }),
    userAddress &&
      chainId &&
      invalidateTokenBalances(config, {
        chainId,
        userAddress,
        tokenAddresses: [CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS as Address],
      }),
  ])
