import { useClosePositionForm } from '@/llamalend/features/manage-liquidation/hooks/useClosePositionForm'
import { ClosePositionInfoList } from '@/llamalend/features/manage-liquidation/ui/ClosePositionInfoList'
import { useMarketContext } from '@/llamalend/features/market-context'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanActionSettings } from '@/llamalend/widgets/action-card/LoanActionSettings'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { FormButton } from '@evm-ui/features/forms'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import TableCell from '@mui/material/TableCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { AlertAdditionalDebtToken } from '../alerts/AlertAdditionalDebtToken'
import { AlertClosePosition } from '../alerts/AlertClosePosition'
import { LabelCellDisplay } from '../cells/LabelCell'
import { ValueCellDisplay } from '../cells/ValueCell'

const { Spacing } = SizesAndSpaces

export const ClosePositionForm = ({ networks }: { networks: NetworkDict<LlamaChainId> }) => {
  const { chainId, marketId, tokens } = useMarketContext<LlamaChainId>()
  const network = networks[chainId]
  const {
    form,
    values,
    table,
    debtTokenSymbol,
    collateralToRecover,
    hasBadDebt,
    missing,
    borrowedBalance,
    isDisabled,
    isPending,
    closeError,
    isApproved,
    onSubmit,
    formErrors,
  } = useClosePositionForm({ network })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<ClosePositionInfoList marketId={marketId} tokens={tokens} chainId={network.chainId} values={values} />}
    >
      <DataTable
        category="form"
        table={table}
        emptyState={{ title: t`No close position data` }}
        errorState={{ title: t`Could not load close position data` }}
        verticalAlign="top"
        footerRow={
          !table.isLoading &&
          collateralToRecover != null && (
            <>
              <TableCell sx={{ padding: Spacing.md }}>
                <LabelCellDisplay label={t`You recover`} isFooter />
              </TableCell>
              <TableCell sx={{ padding: Spacing.md }}>
                <ValueCellDisplay tokens={collateralToRecover} isFooter testId="you-recover" />
              </TableCell>
            </>
          )
        }
      />
      <LoanActionSettings slippage={values.slippage} onSlippageChange={slippage => form.update({ slippage })} />
      {missing != null && borrowedBalance != null && +missing > 0 ? (
        <AlertAdditionalDebtToken debtTokenSymbol={debtTokenSymbol} missing={missing} balance={borrowedBalance} />
      ) : (
        <AlertClosePosition hasBadDebt={hasBadDebt} />
      )}
      <FormButton
        pending={isPending}
        disabled={isDisabled}
        label={[
          isApproved?.data === false && t`Approve`,
          ...(hasBadDebt ? [t`Repay bad debt`] : [t`Repay debt`, t`Recover collateral`]),
        ]}
        testId="close-position-submit-button"
      />

      <FormAlerts
        // the table can keep rows visible on query errors, so surface the table error here too
        error={closeError ?? table.error ?? null}
        formErrors={formErrors}
        handledErrors={[]}
      />
    </Form>
  )
}
