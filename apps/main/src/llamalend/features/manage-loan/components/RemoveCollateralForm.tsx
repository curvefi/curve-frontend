import { hasLeverageValue } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RemoveCollateralOptions } from '@/llamalend/mutations/remove-collateral.mutation'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { InputDivider } from '../../../widgets/InputDivider'
import { useRemoveCollateralForm } from '../hooks/useRemoveCollateralForm'
import { RemoveCollateralInfoList } from './RemoveCollateralInfoList'

export const RemoveCollateralForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onSuccess?: NonNullable<RemoveCollateralOptions['onSuccess']>
}) => {
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    isDisabled,
    onSubmit,
    action,
    values,
    maxRemovable,
    formErrors,
    collateralToken,
    borrowToken,
    txHash,
  } = useRemoveCollateralForm({ market, network, enabled, onSuccess })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <RemoveCollateralInfoList
          market={market}
          form={form}
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
            position: q(maxRemovable),
            tooltip: t`Max Removable Collateral`,
          }}
        />
      </Stack>

      <FormAlerts
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
        disabled={isDisabled}
        data-testid="remove-collateral-submit-button"
      >
        {isPending ? t`Processing...` : t`Remove collateral`}
      </Button>
    </Form>
  )
}
