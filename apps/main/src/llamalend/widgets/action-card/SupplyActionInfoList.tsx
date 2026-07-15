import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useShowNetRate } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import { mapQuery, DISABLED_Q, type QueryProp } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
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
  /** Supply APY with optional previous value */
  supplyApy?: QueryProp<Decimal | null>
  prevSupplyApy?: QueryProp<Decimal | null>
  /** Net supply APY (accounting for rewards, etc.) */
  netSupplyApy?: QueryProp<Decimal | null>
  prevNetSupplyApy?: QueryProp<Decimal | null>
  /** Estimated gas cost for the transaction */
  gas: QueryProp<TxGasInfo | null>
}

/**
 * List with action infos about the supply (like vault shares, amount supplied, supply APY, net supply APY, estimated gas)
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
  supplyApy,
  prevSupplyApy,
  netSupplyApy,
  prevNetSupplyApy,
  gas,
}: SupplyActionInfoListProps) => {
  const shouldShowNetSupplyApy = useShouldShowNetRate({
    tokenSymbol: suppliedSymbol,
    prevNetRate: prevNetSupplyApy,
    prevRate: prevSupplyApy,
    netRate: netSupplyApy,
    rate: supplyApy,
    defaultValue: useShowNetRate('supply'),
  })

  return (
    <ActionInfoCollapse isOpen={isOpen} testId="supply-action-info-list">
      <Stack sx={ACTION_INFO_GROUP_SX}>
        <Stack>
          {(supplyApy ?? prevSupplyApy) && (
            <ActionInfo
              label={t`Supply APY`}
              value={mapQuery(supplyApy ?? DISABLED_Q, data => formatNumber(data, 'percent.rate'))}
              prevValue={prevSupplyApy && mapQuery(prevSupplyApy, data => formatNumber(data, 'percent.rate'))}
              size="small"
              testId="supply-apy"
            />
          )}
          {shouldShowNetSupplyApy && (
            <ActionInfo
              label={NET_SUPPLY_RATE_TITLE}
              value={mapQuery(netSupplyApy ?? DISABLED_Q, data => formatNumber(data, 'percent.rate'))}
              prevValue={prevNetSupplyApy && mapQuery(prevNetSupplyApy, data => formatNumber(data, 'percent.rate'))}
              size="small"
              testId="supply-net-apy"
            />
          )}
        </Stack>
        <Stack>
          <ActionInfo
            label={sharesLabel}
            value={mapQuery(vaultShares, data => formatAmount(data))}
            prevValue={prevVaultShares && mapQuery(prevVaultShares, data => formatAmount(data))}
            size="small"
            testId="supply-vault-shares"
          />
          {(suppliedAssets != null || prevSuppliedAssets != null) && (
            <ActionInfo
              label={amountLabel}
              value={mapQuery(suppliedAssets ?? DISABLED_Q, data => formatNumber(data, { abbreviate: false }))}
              prevValue={
                prevSuppliedAssets && mapQuery(prevSuppliedAssets, data => formatNumber(data, { abbreviate: false }))
              }
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
