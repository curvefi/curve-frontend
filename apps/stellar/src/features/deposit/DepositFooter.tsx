import { asAddress } from '@/features/connect-wallet/address'
import { usePoolConfig } from '@/queries/pool/pool-config.query'
import { usePoolSupply } from '@/queries/pool/pool-supply.query'
import { useTokenBalance } from '@/queries/token/token-balance.query'
import { useTokenDecimals } from '@/queries/token/token-decimals.query'
import { DepositInfoList } from '@ui/features/forms/deposit/DepositInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalEqual, decimalSum } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
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
      gas={mapQuery(fee, value => ({ ...value, tooltip: t`Estimated total network fee, including resource fees.` }))}
      slippage={params.slippage}
      onSlippageChanged={useUserProfileStore(state => state.setMaxSlippage)}
      userAddress={asAddress(params.account ?? undefined)}
    />
  )
}
