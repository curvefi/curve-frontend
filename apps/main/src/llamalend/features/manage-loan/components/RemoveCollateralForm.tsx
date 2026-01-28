import { hasLeverageValue } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RemoveCollateralOptions } from '@/llamalend/mutations/remove-collateral.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { InputDivider } from '../../../widgets/InputDivider'
import { useRemoveCollateralForm } from '../hooks/useRemoveCollateralForm'
import { RemoveCollateralInfoAccordion } from './RemoveCollateralInfoAccordion'

export const RemoveCollateralForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRemoved,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRemoved?: NonNullable<RemoveCollateralOptions['onRemoved']>
}) => {
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    onSubmit,
    action,
    values,
    maxRemovable,
    formErrors,
    collateralToken,
    borrowToken,
    txHash,
  } = useRemoveCollateralForm({
    market,
    network,
    enabled,
    onRemoved,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <RemoveCollateralInfoAccordion
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          leverageEnabled={!!market && hasLeverageValue(market)}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        <LoanFormTokenInput
          label={t`Amount to Remove`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          testId="remove-collateral-input"
          network={network}
          positionBalance={{
            position: maxRemovable,
            tooltip: t`Max Removable Collateral`,
          }}
        />
      </Stack>

      <LoanFormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['userCollateral']}
        successTitle={t`Collateral removed`}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={formErrors.length > 0}
        data-testid="remove-collateral-submit-button"
      >
        {isPending ? t`Processing...` : t`Remove collateral`}
      </Button>
    </Form>
  )
}
