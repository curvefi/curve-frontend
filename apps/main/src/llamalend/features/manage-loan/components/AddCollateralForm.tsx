import { hasLeverageValue } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { AddCollateralOptions } from '@/llamalend/mutations/add-collateral.mutation'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { InputDivider } from '../../../widgets/InputDivider'
import { useAddCollateralForm } from '../hooks/useAddCollateralForm'
import { AddCollateralInfoAccordion } from './AddCollateralInfoAccordion'

export const AddCollateralForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  onAdded,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onAdded?: NonNullable<AddCollateralOptions['onAdded']>
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
    isApproved,
    formErrors,
    collateralToken,
    borrowToken,
    txHash,
  } = useAddCollateralForm({
    market,
    network,
    onAdded,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <AddCollateralInfoAccordion
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
          label={t`Amount to Add`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          testId="add-collateral-input"
          network={network}
        />
      </Stack>

      <FormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['userCollateral']}
        successTitle={t`Collateral added`}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid="add-collateral-submit-button"
      >
        {isPending
          ? t`Processing...`
          : isApproved.data || isApproved.isPending || !values.userCollateral
            ? t`Add collateral`
            : t`Approve & Add collateral`}
      </Button>
    </Form>
  )
}
