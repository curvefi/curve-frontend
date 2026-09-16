import { asAddress } from '@/stellar/features/connect-wallet/address'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { WithdrawInfoList } from '@ui/features/pool-forms/withdraw/WithdrawInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalMinus } from '@ui/lib/decimal'
import type { WithdrawPreview, WithdrawPreviewParams } from './useWithdrawPreview'

export const WithdrawFooter = ({
  params,
  expected,
  maximum,
  priceImpact,
  fee,
}: { params: WithdrawPreviewParams } & WithdrawPreview) => {
  const lpBalance = useTokenBalance({ ...params, token: params.pool, decimals: LP_TOKEN_DECIMALS })
  return (
    <WithdrawInfoList
      expectedLp={expected}
      maximumLp={maximum}
      currentLp={q(lpBalance)}
      projectedLp={combineQueries([lpBalance, expected], decimalMinus)}
      priceImpact={priceImpact}
      gas={fee}
      slippage={params.slippage}
      onSlippageChanged={useUserProfileStore(state => state.setMaxSlippage)}
      userAddress={asAddress(params.account ?? undefined)}
    />
  )
}
