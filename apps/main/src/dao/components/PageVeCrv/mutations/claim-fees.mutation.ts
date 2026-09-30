import { noop } from 'lodash'
import { useCallback, useState } from 'react'
import { ethAddress } from 'viem'
import { useConfig } from 'wagmi'
import {
  CLAIM_FEES_TOKENS,
  CLAIM_TOKEN_ADDRESSES,
  type ClaimFeesMutation,
  type ClaimFeesQuery,
  type ClaimFeesToken,
} from '@/dao/components/PageVeCrv/queries/claim-fees.types'
import { claimFeesValidationSuite } from '@/dao/components/PageVeCrv/queries/claim-fees.validation'
import { invalidateClaimableFees } from '@/dao/components/PageVeCrv/queries/claimable-fees.query'
import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { invalidateTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { type TransactionContext, useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import type { Address, Hex } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'

type ClaimFeesContext = TransactionContext & Omit<ClaimFeesQuery, 'token'>
type ClaimFeesResult = { hash: Hex; chainId: ChainId }

export const useClaimFeesMutation = ({
  chainId,
  userAddress,
}: {
  chainId: ChainId
  userAddress: Address | undefined
}) => {
  const config = useConfig()
  const [claimingToken, setClaimingToken] = useState<ClaimFeesToken>()
  const { mutate, error, isPending } = useEvmMutation<ClaimFeesMutation, ClaimFeesContext, ClaimFeesResult>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'claimFees'] as const,
    validationSuite: claimFeesValidationSuite,
    validationParams: { chainId, userAddress },
    buildContext: (_, context) => ({ ...context, chainId, userAddress: context.wallet.address }),
    mutationFn: async ({ token }, { chainId, userAddress }) => {
      const { boosting } = requireLib('curveApi')
      const claimMethods = { '3CRV': boosting.claimFees, crvUSD: boosting.claimFeesCrvUSD } satisfies Record<
        ClaimFeesToken,
        unknown
      >
      const hash = (await claimMethods[token](userAddress)) as Hex
      return { hash, chainId }
    },
    pendingMessage: ({ token }) => t`Claiming ${token} fees...`,
    successMessage: ({ token }) => t`${token} fees have been claimed and sent to your wallet.`,
    onReset: noop,
    onSuccess: async (_, _receipt, { token }, { chainId, userAddress }) => {
      await Promise.all([
        ...CLAIM_FEES_TOKENS.map(token => invalidateClaimableFees({ chainId, userAddress, token })),
        invalidateTokenBalances(config, {
          chainId,
          userAddress,
          tokenAddresses: [CLAIM_TOKEN_ADDRESSES[token], ethAddress],
        }),
      ])
    },
  })

  const onSubmit = useCallback(
    (token: ClaimFeesToken) => {
      setClaimingToken(token)
      mutate({ token })
    },
    [mutate],
  )

  return { onSubmit, error, claimingToken, isPending }
}
