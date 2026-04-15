import { useClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/hooks/useClosePositionForm'
import { ClosePositionInfoList } from '@/llamalend/features/manage-soft-liquidation/ui/ClosePositionInfoList'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { joinButtonText } from '@primitives/string.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { AlertAdditionalCrvUsd } from '../alerts/AlertAdditionalCrvUsd'
import { AlertClosePosition } from '../alerts/AlertClosePosition'

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
    debtToken: { data: debtTokenData, error: debtTokenError, isLoading: debtTokenLoading },
    collateralToRecover: {
      data: collateralToRecoverData,
      isLoading: collateralToRecoverLoading,
      error: collateralToRecoverError,
      totalUsd: totalCollateralToRecoverUsd,
    },
    canClose: { data: canClose, error: canCloseError },
    isDisabled,
    isPending,
    closeError,
    isApproved,
    onSubmit,
    formErrors,
  } = useClosePositionForm({ market, network, enabled })
  const { amount: debtToRepay } = debtTokenData ?? {}
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
          onSlippageChange={(slippage) => updateForm(form, { slippage })}
        />
      }
    >
      <Stack direction="row" gap={Spacing.xs} justifyContent="space-around">
        <Metric
          testId="debt-to-close-position"
          label={t`Debt to repay`}
          value={debtToRepay == null ? undefined : Number(debtToRepay)}
          valueOptions={{ abbreviate: true }}
          notional={debtTokenData?.symbol ?? ''}
          alignment="center"
          size="large"
          loading={debtTokenLoading}
        />

        <Metric
          label={t`Collateral to recover`}
          testId="withdraw-amount"
          value={totalCollateralToRecoverUsd && Number(totalCollateralToRecoverUsd)}
          valueOptions={{ unit: 'dollar' }}
          notional={(collateralToRecoverData ?? [])
            .filter((x) => +x.amount > 0)
            .map((x) => ({
              value: +x.amount,
              unit: { symbol: ` ${x.symbol}`, position: 'suffix' },
              abbreviate: true,
            }))}
          alignment="center"
          size="large"
          loading={collateralToRecoverLoading}
        />
      </Stack>

      <AlertClosePosition />
      {canClose?.canClose === false && (
        <AlertAdditionalCrvUsd
          debtTokenSymbol={debtTokenData?.symbol}
          missing={canClose.missing}
          balance={canClose.balance}
        />
      )}

      <Stack gap={Spacing.xs}>
        <Button type="submit" loading={isPending} disabled={isDisabled} data-testid="close-position-submit-button">
          {isPending
            ? t`Processing...`
            : joinButtonText(isApproved?.data === false && t`Approve`, t`Repay debt`, t`Withdraw collateral`)}
        </Button>
      </Stack>

      <FormAlerts
        error={closeError ?? debtTokenError ?? collateralToRecoverError ?? canCloseError ?? null}
        formErrors={formErrors}
        handledErrors={[]}
      />
    </Form>
  )
}
