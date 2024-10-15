import type { SignerPoolDetails, SignerPoolBalances } from '@/entities/signer'
import type { Address } from 'viem'

import { useMemo } from 'react'
import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { createQueryHook } from '@/shared/lib/queries/factory'
import { signerKeys } from '@/entities/signer/model'
import useStore from '@/store/useStore'
import * as api from '@/entities/signer/api'
import * as conditions from '@/entities/signer/model'

export const useSignerAddress = (): { data: Address | undefined } => {
  const onboardInstance = useStore((state) => state.wallet.onboard)
  const signerAddress = onboardInstance?.state.get().wallets?.[0]?.accounts?.[0]?.address
  return { data: signerAddress }
}
export const useIsSignerConnected = () => {
  const { data: signerAddress } = useSignerAddress()
  return { data: !!signerAddress }
}
export const useTokensBalances = (
  tokens: (Address | undefined)[]
): { data: (string | undefined)[]; isLoading: boolean } => {
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const userBalancesLoading = useStore((state) => state.userBalances.loading)

  const tokensKey = JSON.stringify(tokens)

  const balances = useMemo(() => {
    if (userBalancesLoading) return tokens.map(() => undefined)
    return tokens.map((token) => (token ? userBalancesMapper[token] : undefined))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensKey, userBalancesMapper, userBalancesLoading])

  return { data: balances, isLoading: userBalancesLoading }
}

export const useSignerPoolBalances = createQueryHook((params: SignerPoolBalances) =>
  queryOptions({
    queryKey: signerKeys.signerPoolBalances(params),
    queryFn: api.querySignerPoolBalances,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.enableSignerPoolBase(params),
  })
)

export const userSignerPoolDetails = createQueryHook((params: SignerPoolDetails) => {
  return queryOptions({
    queryKey: signerKeys.signerPoolDetails(params),
    queryFn: api.querySignerPoolDetails,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.enableSignerPoolDetails(params),
  })
})
