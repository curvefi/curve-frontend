import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useShowNetRate } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber, formatPercent } from '@ui-kit/utils'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { useShouldShowNetRate } from './hooks/useShouldShowNetRate'
import { formatAmount, ACTION_INFO_GROUP_SX, combineActionInfoState } from './info-actions.helpers'

export type SupplyActionInfoListProps = {
  isOpen: boolean
  isApproved?: boolean
  /** Vault shares with optional previous value for comparison */
  vaultShares: QueryProp<Decimal | null>
  prevVaultShares?: QueryProp<Decimal | null>
  /** Label for the shares ActionInfo */
  sharesLabel?: string
  /** Amount supplied in underlying asset with optional previous value */
  amountSupplied?: QueryProp<Decimal | null>
  prevAmountSupplied?: QueryProp<Decimal | null>
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
  amountSupplied,
  prevAmountSupplied,
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
      <Stack sx={{ ...ACTION_INFO_GROUP_SX }}>
        <Stack>
          {(supplyApy || prevSupplyApy) && (
            <ActionInfo
              label={t`Supply APY`}
              value={supplyApy?.data && formatPercent(supplyApy.data)}
              prevValue={prevSupplyApy?.data && formatPercent(prevSupplyApy.data)}
              {...combineActionInfoState(supplyApy, prevSupplyApy)}
              size="small"
              testId="supply-apy"
            />
          )}
          {shouldShowNetSupplyApy && (
            <ActionInfo
              label={NET_SUPPLY_RATE_TITLE}
              value={netSupplyApy?.data && formatPercent(netSupplyApy.data)}
              prevValue={prevNetSupplyApy?.data && formatPercent(prevNetSupplyApy.data)}
              {...combineActionInfoState(netSupplyApy, prevNetSupplyApy)}
              size="small"
              testId="supply-net-apy"
            />
          )}
        </Stack>
        <Stack>
          <ActionInfo
            label={sharesLabel}
            value={vaultShares?.data && formatAmount(vaultShares.data)}
            prevValue={prevVaultShares?.data && formatAmount(prevVaultShares.data)}
            {...combineActionInfoState(vaultShares, prevVaultShares)}
            size="small"
            testId="supply-vault-shares"
          />
          {(amountSupplied || prevAmountSupplied) && (
            <ActionInfo
              label={amountLabel}
              value={amountSupplied?.data && formatNumber(amountSupplied.data, { abbreviate: false })}
              prevValue={prevAmountSupplied?.data && formatNumber(prevAmountSupplied.data, { abbreviate: false })}
              {...combineActionInfoState(amountSupplied, prevAmountSupplied)}
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
