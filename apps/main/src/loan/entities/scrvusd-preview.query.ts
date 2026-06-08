import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type {
  ScrvUsdDepositParams,
  ScrvUsdDepositQuery,
  ScrvUsdWithdrawParams,
  ScrvUsdWithdrawQuery,
} from './scrvusd.validation'
import { scrvUsdDepositValidationSuite, scrvUsdWithdrawValidationSuite } from './scrvusd.validation'

export const { useQuery: useScrvUsdPreviewDeposit } = queryFactory({
  queryKey: ({ chainId, userAddress, depositAmount }: ScrvUsdDepositParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.previewDeposit', { depositAmount }] as const,
  queryFn: async ({ depositAmount }: ScrvUsdDepositQuery) =>
    (await requireLib('llamaApi').st_crvUSD.previewDeposit(depositAmount)) as Decimal,
  category: 'savings.user',
  validationSuite: scrvUsdDepositValidationSuite,
})

export const { useQuery: useScrvUsdPreviewWithdraw } = queryFactory({
  queryKey: ({ chainId, userAddress, withdrawAmount, isFull, userVaultShares }: ScrvUsdWithdrawParams) =>
    [
      ...rootKeys.userChain({ chainId, userAddress }),
      'st_crvUSD.previewWithdraw',
      { withdrawAmount },
      { isFull },
      { userVaultShares },
    ] as const,
  queryFn: async ({ withdrawAmount, isFull, userVaultShares }: ScrvUsdWithdrawQuery) => {
    const { st_crvUSD } = requireLib('llamaApi')
    const r = isFull ? await st_crvUSD.previewRedeem(userVaultShares) : await st_crvUSD.previewWithdraw(withdrawAmount)
    return r as Decimal
  },
  category: 'savings.user',
  validationSuite: scrvUsdWithdrawValidationSuite,
})
