import { useClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/hooks/useClosePositionForm'
import { ClosePositionInfoList } from '@/llamalend/features/manage-soft-liquidation/ui/ClosePositionInfoList'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { joinButtonText } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { AlertAdditionalCrvUsd } from '../alerts/AlertAdditionalCrvUsd'
import { AlertClosePosition } from '../alerts/AlertClosePosition'
import { ButtonGetCrvUsd } from '../ButtonGetCrvUsd'

const { Spacing } = SizesAndSpaces

export const ClosePositionForm = ({
  market,
  networks,
  chainId,
  enabled,
  onClosed,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<LlamaChainId>
  chainId: LlamaChainId
  enabled?: boolean
  onClosed?: () => void
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
    isClosed,
    closeError,
    txHash,
    isApproved,
    onSubmit,
    formErrors,
  } = useClosePositionForm({ market, network, onClosed, enabled })
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
          label={t`Debt to repay`}
          value={debtToRepay == null ? undefined : +debtToRepay}
          valueOptions={{ abbreviate: true }}
          notional={debtTokenData?.symbol ?? ''}
          alignment="center"
          size="large"
          loading={debtTokenLoading}
        />

        <Metric
          label={t`Collateral to recover`}
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
      {canClose?.canClose === false && debtTokenData?.symbol && (
        <AlertAdditionalCrvUsd debtTokenSymbol={debtTokenData.symbol} missing={canClose.missing} />
      )}

      <Stack gap={Spacing.xs}>
        <Button type="submit" loading={isPending} disabled={isDisabled}>
          {isPending
            ? t`Processing...`
            : joinButtonText(isApproved?.data === false && t`Approve`, t`Repay debt`, t`close position`)}
        </Button>

        <ButtonGetCrvUsd />
      </Stack>

      <FormAlerts
        network={network}
        isSuccess={isClosed}
        error={closeError ?? debtTokenError ?? collateralToRecoverError ?? canCloseError ?? null}
        txHash={txHash}
        formErrors={formErrors}
        handledErrors={[]}
        successTitle={t`Position closed`}
      />
    </Form>
  )
}
