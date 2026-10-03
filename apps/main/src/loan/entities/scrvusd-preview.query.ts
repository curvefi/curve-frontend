import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type {
  ScrvUsdDepositParams,
  ScrvUsdDepositQuery,
  ScrvUsdWithdrawParams,
  ScrvUsdWithdrawQuery,
} from './scrvusd.validation'
import { scrvUsdDepositValidationSuite, scrvUsdWithdrawValidationSuite } from './scrvusd.validation'

export const { useQuery: useScrvUsdPreviewDeposit } = queryFactory({
  queryKey: ({ chainId, userAddress, depositAmount }: ScrvUsdDepositParams) => ({
    name: 'st_crvUSD.previewDeposit',
    chainId,
    userAddress,
    depositAmount,
  }),
  queryFn: async ({ depositAmount }: ScrvUsdDepositQuery) =>
    (await requireLib('llamaApi').st_crvUSD.previewDeposit(depositAmount)) as Decimal,
  category: 'savings.user',
  validationSuite: scrvUsdDepositValidationSuite,
})

export const { useQuery: useScrvUsdPreviewWithdraw } = queryFactory({
  queryKey: ({ chainId, userAddress, withdrawAmount, isFull, maxWithdrawAmount }: ScrvUsdWithdrawParams) => ({
    name: 'st_crvUSD.previewRedeem',
    chainId,
    userAddress,
    withdrawAmount,
    isFull,
    maxWithdrawAmount,
  }),
  queryFn: async ({ withdrawAmount, isFull, maxWithdrawAmount }: ScrvUsdWithdrawQuery) => {
    const { st_crvUSD } = requireLib('llamaApi')
    const shares = isFull ? maxWithdrawAmount : withdrawAmount
    return (await st_crvUSD.previewRedeem(shares)) as Decimal
  },
  category: 'savings.user',
  validationSuite: scrvUsdWithdrawValidationSuite,
})
