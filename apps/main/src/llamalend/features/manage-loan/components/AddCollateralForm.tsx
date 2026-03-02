import { hasLeverageValue } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { AddCollateralOptions } from '@/llamalend/mutations/add-collateral.mutation'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { InputDivider } from '../../../widgets/InputDivider'
import { useAddCollateralForm } from '../hooks/useAddCollateralForm'
import { AddCollateralInfoList } from './AddCollateralInfoList'

export const AddCollateralForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onSuccess?: NonNullable<AddCollateralOptions['onSuccess']>
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
    maxCollateral,
  } = useAddCollateralForm({ market, network, onSuccess })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <AddCollateralInfoList
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
          label={t`Amount to Add`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          testId="add-collateral-input"
          network={network}
          max={{ ...q(maxCollateral), fieldName: 'maxCollateral' }}
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
