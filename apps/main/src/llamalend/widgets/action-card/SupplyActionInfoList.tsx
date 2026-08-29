import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { useShowNetRate } from '@evm-ui/hooks/useLocalStorage'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@evm-ui/shared/ui/ActionInfo'
import { mapQuery, DISABLED_Q, type QueryProp } from '@evm-ui/types/util'
import { formatCappedRatePercent, formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { useShouldShowNetRate } from './hooks/useShouldShowNetRate'
import { formatAmount, ACTION_INFO_GROUP_SX } from './info-actions.helpers'

type SupplyActionInfoListProps = {
  isOpen: boolean
  isApproved?: boolean
  /** Vault shares with optional previous value for comparison */
  vaultShares: QueryProp<Decimal | null>
  prevVaultShares?: QueryProp<Decimal | null>
  /** Label for the shares ActionInfo */
  sharesLabel?: string
  /** Amount supplied in underlying asset with optional previous value */
  suppliedAssets?: QueryProp<Decimal | null>
  prevSuppliedAssets?: QueryProp<Decimal | null>
  /** Label for the amount ActionInfo */
  amountLabel?: string
  /** Symbol of the supplied asset */
  suppliedSymbol?: string
  /** Supply rate with optional previous value */
  supplyRate?: QueryProp<Decimal | null>
  prevSupplyRate?: QueryProp<Decimal | null>
  /** Net supply rate (accounting for rewards, etc.) */
  netSupplyRate?: QueryProp<Decimal | null>
  prevNetSupplyRate?: QueryProp<Decimal | null>
  /** Estimated gas cost for the transaction */
  gas: QueryProp<TxGasInfo | null>
}

/**
 * List with action infos about the supply (like vault shares, amount supplied, supply rate, net supply rate, estimated gas)
 * By default, the action info are hidden. They are visible when the isOpen prop is true.
 */
export const SupplyActionInfoList = ({
  isOpen,
  isApproved,
  vaultShares,
  prevVaultShares,
  suppliedAssets,
  prevSuppliedAssets,
  sharesLabel = t`Vault Shares`,
  amountLabel = t`Amount Supplied`,
  suppliedSymbol,
  supplyRate,
  prevSupplyRate,
  netSupplyRate,
  prevNetSupplyRate,
  gas,
}: SupplyActionInfoListProps) => {
  const rateDisplay = useRateDisplay()
  const shouldShowNetSupplyRate = useShouldShowNetRate({
    tokenSymbol: suppliedSymbol,
    prevNetRate: prevNetSupplyRate,
    prevRate: prevSupplyRate,
    netRate: netSupplyRate,
    rate: supplyRate,
    defaultValue: useShowNetRate('supply'),
  })

  return (
    <ActionInfoCollapse isOpen={isOpen} testId="supply-action-info-list">
      <Stack sx={ACTION_INFO_GROUP_SX}>
        <Stack>
          {(supplyRate ?? prevSupplyRate) && (
            <ActionInfo
              label={rateDisplay === 'apy' ? t`Supply APY` : t`Supply APR`}
              value={mapQuery(prevSupplyRate ?? DISABLED_Q, data => formatCappedRatePercent(data))}
              futureValue={mapQuery(supplyRate ?? DISABLED_Q, data => formatCappedRatePercent(data))}
              size="small"
              testId="supply-rate"
            />
          )}
          {shouldShowNetSupplyRate && (
            <ActionInfo
              label={rateDisplay === 'apy' ? t`Net Supply APY` : t`Net Supply APR`}
              value={mapQuery(prevNetSupplyRate ?? DISABLED_Q, data => formatCappedRatePercent(data))}
              futureValue={mapQuery(netSupplyRate ?? DISABLED_Q, data => formatCappedRatePercent(data))}
              size="small"
              testId="supply-net-rate"
            />
          )}
        </Stack>
        <Stack>
          <ActionInfo
            label={sharesLabel}
            value={mapQuery(prevVaultShares ?? DISABLED_Q, data => formatAmount(data))}
            futureValue={mapQuery(vaultShares, data => formatAmount(data))}
            size="small"
            testId="supply-vault-shares"
          />
          {(suppliedAssets != null || prevSuppliedAssets != null) && (
            <ActionInfo
              label={amountLabel}
              value={mapQuery(prevSuppliedAssets ?? DISABLED_Q, data => formatNumber(data, { abbreviate: false }))}
              futureValue={mapQuery(suppliedAssets ?? DISABLED_Q, data => formatNumber(data, { abbreviate: false }))}
              valueRight={suppliedSymbol}
              size="small"
              testId="supply-amount"
            />
          )}
        </Stack>
      </Stack>
      <Stack>
        <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
      </Stack>
    </ActionInfoCollapse>
  )
}
