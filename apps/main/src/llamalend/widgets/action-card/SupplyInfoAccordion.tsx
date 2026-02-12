import Stack from '@mui/material/Stack'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { Query } from '@ui-kit/types/util'
import { type Decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { ActionInfoAccordion } from './info-accordion.components'
import { formatAmount } from './info-accordion.helpers'

export type SupplyInfoAccordionProps = {
  isOpen: boolean
  isApproved?: boolean
  /** Vault shares with optional previous value for comparison */
  vaultShares: Query<Decimal | null>
  prevVaultShares?: Query<Decimal | null>
  /** Label for the shares ActionInfo */
  sharesLabel?: string
  /** Amount supplied in underlying asset with optional previous value */
  amountSupplied?: Query<Decimal | null>
  prevAmountSupplied?: Query<Decimal | null>
  /** Label for the amount ActionInfo */
  amountLabel?: string
  /** Symbol of the supplied asset */
  suppliedSymbol?: string
  /** Supply APY with optional previous value */
  supplyApy?: Query<Decimal | null>
  prevSupplyApy?: Query<Decimal | null>
  /** Net supply APY (accounting for rewards, etc.) */
  netSupplyApy?: Query<Decimal | null>
  /** Estimated gas cost for the transaction */
  gas: Query<TxGasInfo | null>
}

export const SupplyInfoAccordion = ({
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
}: SupplyInfoAccordionProps) => (
  <ActionInfoAccordion isOpen={isOpen} testId="supply-info-accordion">
    <Stack>
      <ActionInfo
        label={sharesLabel}
        value={vaultShares?.data && formatAmount(vaultShares.data)}
        prevValue={prevVaultShares?.data && formatAmount(prevVaultShares.data)}
        {...combineQueryState(vaultShares, prevVaultShares)}
        testId="supply-info-accordion"
      />
      {(amountSupplied || prevAmountSupplied) && (
        <ActionInfo
          label={amountLabel}
          value={amountSupplied?.data && formatNumber(amountSupplied.data, { abbreviate: false })}
          prevValue={prevAmountSupplied?.data && formatNumber(prevAmountSupplied.data, { abbreviate: false })}
          {...combineQueryState(amountSupplied, prevAmountSupplied)}
          valueRight={suppliedSymbol}
          testId="supply-amount"
        />
      )}
      {(supplyApy || prevSupplyApy) && (
        <ActionInfo
          label="Supply APY"
          value={supplyApy?.data && formatPercent(supplyApy.data)}
          prevValue={prevSupplyApy?.data && formatPercent(prevSupplyApy.data)}
          {...combineQueryState(supplyApy, prevSupplyApy)}
          testId="supply-apy"
        />
      )}
      {netSupplyApy && (
        <ActionInfo
          label={t`Net Supply APY`}
          value={netSupplyApy.data && formatPercent(netSupplyApy.data)}
          {...combineQueryState(netSupplyApy)}
          testId="supply-net-apy"
        />
      )}
    </Stack>

    <Stack>
      <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
    </Stack>
  </ActionInfoAccordion>
)
