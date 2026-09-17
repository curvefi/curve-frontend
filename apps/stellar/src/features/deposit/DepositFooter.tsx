import { asAddress } from '@/stellar/features/connect-wallet/address'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { useTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { DepositInfoList } from '@ui/features/pool-forms/deposit/DepositInfoList'
import { combineQueries } from '@ui/features/queries/combine'
import { q } from '@ui/features/queries/util'
import { decimalEqual, decimalSum } from '@ui/lib/decimal'
import { type DepositPreview, type DepositPreviewParams } from './useDepositPreview'

/** Returns the amount of seed locked in the pool if the pool is empty, otherwise returns null. */
const useSeedLock = (params: DepositPreviewParams) =>
  combineQueries([usePoolConfig(params), usePoolSupply(params)], ({ seedLock }, supply) =>
    decimalEqual(supply, '0') ? seedLock : null,
  )

export const DepositFooter = ({
  params,
  quote,
  minimum,
  priceImpact,
  gas,
}: { params: DepositPreviewParams } & DepositPreview) => {
  const lpDecimals = useTokenDecimals({ ...params, token: params.pool })
  const lpBalance = useTokenBalance({ ...params, token: params.pool, decimals: lpDecimals.data })
  return (
    <DepositInfoList
      expectedLp={q(quote)}
      minimumLp={minimum}
      currentLp={q(lpBalance)}
      projectedLp={combineQueries([lpBalance, quote], decimalSum)}
      priceImpact={priceImpact}
      seedLock={useSeedLock(params)}
      gas={gas}
      slippage={params.slippage}
      userAddress={asAddress(params.account)}
    />
  )
}
