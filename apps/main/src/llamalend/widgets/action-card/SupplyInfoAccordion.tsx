import Stack from '@mui/material/Stack'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { Query } from '@ui-kit/types/util'
import { type Decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { ActionInfoAccordion, EstimatedTxCost, TxGasInfo } from './info-accordion.components'
import { formatAmount } from './info-accordion.helpers'

export type SupplyInfoAccordionProps = {
  isOpen: boolean
  toggle: () => void
  isApproved?: boolean
  /** Vault shares with optional previous value for comparison */
  vaultShares: Query<Decimal | null>
  prevVaultShares?: Query<Decimal | null>
  /** Amount supplied in underlying asset with optional previous value */
  amountSupplied?: Query<Decimal | null>
  prevAmountSupplied?: Query<Decimal | null>
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
  toggle,
  isApproved,
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  suppliedSymbol,
  supplyApy,
  prevSupplyApy,
  netSupplyApy,
  gas,
}: SupplyInfoAccordionProps) => (
  <ActionInfoAccordion
    title={t`Vault Shares`}
    info={
      <ActionInfo
        label=""
        value={vaultShares?.data && formatAmount(vaultShares.data)}
        prevValue={prevVaultShares?.data && formatAmount(prevVaultShares.data)}
        {...combineQueryState(vaultShares, prevVaultShares)}
        testId="supply-vault-shares"
      />
    }
    testId="supply-info-accordion"
    expanded={isOpen}
    toggle={toggle}
  >
    <Stack>
      {(amountSupplied || prevAmountSupplied) && (
        <ActionInfo
          label={t`Amount Supplied`}
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
      <EstimatedTxCost gas={gas} isApproved={isApproved} />
    </Stack>
  </ActionInfoAccordion>
)
