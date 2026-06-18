import { useClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/hooks/useClosePositionForm'
import { ClosePositionInfoList } from '@/llamalend/features/manage-soft-liquidation/ui/ClosePositionInfoList'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import { joinButtonText } from '@primitives/string.utils'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { AlertAdditionalDebtToken } from '../alerts/AlertAdditionalDebtToken'
import { AlertClosePosition } from '../alerts/AlertClosePosition'
import { LabelCellDisplay } from '../cells/LabelCell'
import { ValueCellDisplay } from '../cells/ValueCell'
import type { ClosePositionRow } from '../columns/columns.definitions'

const { Spacing } = SizesAndSpaces

export const ClosePositionForm = ({
  market,
  networks,
  chainId,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<LlamaChainId>
  chainId: LlamaChainId
  enabled?: boolean
}) => {
  const network = networks[chainId]
  const {
    form,
    values,
    table,
    debtTokenSymbol,
    collateralToRecover,
    collateralToRecoverUsd,
    missing,
    borrowedBalance,
    isDisabled,
    isPending,
    closeError,
    isApproved,
    onSubmit,
    formErrors,
  } = useClosePositionForm({ market, network, enabled })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      onSubmit={onSubmit}
      footer={
        <ClosePositionInfoList
          market={market}
          chainId={network.chainId}
          networks={networks}
          values={values}
          onSlippageChange={slippage => form.update({ slippage })}
        />
      }
    >
      <DataTable<ClosePositionRow>
        table={table}
        emptyState={
          <EmptyStateRow table={table}>
            <EmptyStateCard
              title={table.error ? t`Could not load position close data` : t`No close position data`}
              description={table.error?.message}
            />
          </EmptyStateRow>
        }
        verticalAlign="top"
        hideHeader
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
        <AlertClosePosition badDebt={collateralToRecoverUsd <= 0} />
      )}
      <Stack sx={{ gap: Spacing.xs }}>
        <Button type="submit" loading={isPending} disabled={isDisabled} data-testid="close-position-submit-button">
          {isPending
            ? t`Processing...`
            : joinButtonText(
                isApproved?.data === false && t`Approve`,
                ...(collateralToRecoverUsd <= 0 ? [t`Repay bad debt`] : [t`Repay debt`, t`Recover collateral`]),
              )}
        </Button>
      </Stack>
      <FormAlerts error={closeError ?? null} formErrors={formErrors} handledErrors={[]} />
    </Form>
  )
}
