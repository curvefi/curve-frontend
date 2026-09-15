import { asAddress } from '@/stellar/features/connect-wallet/address'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { useTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { DepositInfoList } from '@ui/features/pool-forms/deposit/DepositInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalEqual, decimalSum } from '@ui/lib/decimal'
import { type DepositPreviewParams, type DepositPreview } from './useDepositPreview'

export const DepositFooter = ({ params, preview }: { params: DepositPreviewParams; preview: DepositPreview }) => {
  const config = usePoolConfig(params)
  const supply = usePoolSupply(params)
  const lpDecimals = useTokenDecimals({ ...params, token: params.pool })
  const lpBalance = useTokenBalance({ ...params, token: params.pool, decimals: lpDecimals.data })
  const { quote, minimum, priceImpact, fee } = preview
  return (
    <DepositInfoList
      expectedLp={q(quote)}
      minimumLp={minimum}
      currentLp={q(lpBalance)}
      projectedLp={combineQueries([lpBalance, quote], decimalSum)}
      priceImpact={priceImpact}
      seedLock={combineQueries([config, supply], (pool, supply) => (decimalEqual(supply, '0') ? pool.seedLock : null))}
      gas={fee}
      slippage={params.slippage}
      onSlippageChanged={useUserProfileStore(state => state.setMaxSlippage)}
      userAddress={asAddress(params.account ?? undefined)}
    />
  )
}
