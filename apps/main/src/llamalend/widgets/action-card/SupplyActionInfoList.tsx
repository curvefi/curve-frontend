import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber, formatPercent } from '@ui-kit/utils'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { formatAmount, ACTION_INFO_GROUP_SX } from './info-actions.helpers'

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
  gas,
}: SupplyActionInfoListProps) => (
  <ActionInfoCollapse isOpen={isOpen} testId="supply-action-info-list">
    <Stack sx={{ ...ACTION_INFO_GROUP_SX }}>
      <Stack>
        {(supplyApy || prevSupplyApy) && (
          <ActionInfo
            label="Supply APY"
            value={supplyApy?.data && formatPercent(supplyApy.data)}
            prevValue={prevSupplyApy?.data && formatPercent(prevSupplyApy.data)}
            {...combineQueryState(supplyApy, prevSupplyApy)}
            size="small"
            testId="supply-apy"
          />
        )}
        {netSupplyApy && (
          <ActionInfo
            label={t`Net Supply APY`}
            value={netSupplyApy.data && formatPercent(netSupplyApy.data)}
            {...combineQueryState(netSupplyApy)}
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
          {...combineQueryState(vaultShares, prevVaultShares)}
          size="small"
          testId="supply-vault-shares"
        />
        {(amountSupplied || prevAmountSupplied) && (
          <ActionInfo
            label={amountLabel}
            value={amountSupplied?.data && formatNumber(amountSupplied.data, { abbreviate: false })}
            prevValue={prevAmountSupplied?.data && formatNumber(prevAmountSupplied.data, { abbreviate: false })}
            {...combineQueryState(amountSupplied, prevAmountSupplied)}
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
