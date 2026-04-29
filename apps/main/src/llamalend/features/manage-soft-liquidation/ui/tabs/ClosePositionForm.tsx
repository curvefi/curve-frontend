import { sumBy } from 'lodash'
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
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { updateForm } from '@ui-kit/utils/react-form.utils'
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
    missing,
    borrowedBalance,
    isDisabled,
    isPending,
    isLoading,
    error,
    closeError,
    isApproved,
    onSubmit,
    formErrors,
  } = useClosePositionForm({ market, network, enabled })

  const collateralToRecoverUsd = sumBy(collateralToRecover, ({ usd }) => Number(usd) || 0)

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <ClosePositionInfoList
          market={market}
          chainId={network.chainId}
          networks={networks}
          values={values}
          onSlippageChange={slippage => updateForm(form, { slippage })}
        />
      }
    >
      <DataTable<ClosePositionRow>
        table={table}
        emptyState={
          <EmptyStateRow table={table}>
            {error ? t`Could not load position data: ${error.message}` : t`Could not load position close data`}
          </EmptyStateRow>
        }
        loading={isLoading}
        verticalAlign="top"
        hideHeader
        footerRow={
          !isLoading &&
          collateralToRecover != null && (
            <>
              <TableCell sx={{ borderBottom: 'none', padding: Spacing.md }}>
                <LabelCellDisplay label={t`You recover`} isFooter />
              </TableCell>
              <TableCell sx={{ borderBottom: 'none', padding: Spacing.md }}>
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

      <Stack gap={Spacing.xs}>
        <Button type="submit" loading={isPending} disabled={isDisabled} data-testid="close-position-submit-button">
          {isPending
            ? t`Processing...`
            : joinButtonText(
                isApproved?.data === false && t`Approve`,
                ...(collateralToRecoverUsd <= 0 ? [t`Repay bad debt`] : [t`Repay debt`, t`Recover collateral`]),
              )}
        </Button>
      </Stack>

      <FormAlerts error={error ?? closeError ?? null} formErrors={formErrors} handledErrors={[]} />
    </Form>
  )
}
