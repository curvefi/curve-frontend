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
  queryFn: async ({ withdrawAmount, isFull, userVaultShares }: ScrvUsdWithdrawQuery) =>
    (await (isFull
      ? requireLib('llamaApi').st_crvUSD.previewRedeem(userVaultShares)
      : requireLib('llamaApi').st_crvUSD.previewWithdraw(withdrawAmount))) as Decimal,
  category: 'savings.user',
  validationSuite: scrvUsdWithdrawValidationSuite,
})
