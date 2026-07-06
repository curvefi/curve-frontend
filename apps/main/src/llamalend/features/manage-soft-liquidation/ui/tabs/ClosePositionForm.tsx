import { useClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/hooks/useClosePositionForm'
import { ClosePositionInfoList } from '@/llamalend/features/manage-soft-liquidation/ui/ClosePositionInfoList'
import { useMarketContext } from '@/llamalend/features/market-context'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { AlertAdditionalDebtToken } from '../alerts/AlertAdditionalDebtToken'
import { AlertClosePosition } from '../alerts/AlertClosePosition'
import { LabelCellDisplay } from '../cells/LabelCell'
import { ValueCellDisplay } from '../cells/ValueCell'
import type { ClosePositionRow } from '../columns/columns.definitions'

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
      footer={
        <ClosePositionInfoList
          marketId={marketId}
          tokens={tokens}
          chainId={network.chainId}
          networks={networks}
          values={values}
          onSlippageChange={slippage => form.update({ slippage })}
        />
      }
    >
      <DataTable<ClosePositionRow>
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
