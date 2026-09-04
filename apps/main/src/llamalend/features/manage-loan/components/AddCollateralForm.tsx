import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { q, type Range } from '@ui/features/queries/util'
import { useMarketContext } from '../../market-context'
import { useAddCollateralForm } from '../hooks/useAddCollateralForm'
import { AddCollateralInfoList } from './AddCollateralInfoList'

export const AddCollateralForm = <ChainId extends IChainId>({
  networks,
  onPricesUpdated,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) => {
  const { chainId, marketId, controllerAddress, marketType } = useMarketContext<ChainId>()
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
    maxCollateral,
  } = useAddCollateralForm({ network, onPricesUpdated })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <AddCollateralInfoList
          form={form}
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          controllerAddress={controllerAddress}
          marketType={marketType}
        />
      }
    >
      <Stack>
        <LoanFormTokenInput
          label={t`Amount to Add`}
          token={collateralToken}
          blockchainId={network.blockchainId}
          name="userCollateral"
          form={form}
          testId="add-collateral-input"
          network={network}
          max={{ ...q(maxCollateral), fieldName: 'maxCollateral' }}
        />
      </Stack>

      <FormAlerts error={action.error} formErrors={formErrors} handledErrors={['userCollateral']} />

      <FormButton
        pending={isPending}
        loading={!marketId}
        disabled={isDisabled}
        label={[isApproved.data === false && t`Approve`, t`Add collateral`]}
        testId="add-collateral-submit-button"
      />
    </Form>
  )
}
