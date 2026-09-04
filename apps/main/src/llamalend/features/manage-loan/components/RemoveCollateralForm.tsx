import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { FormButton } from '@evm-ui/features/forms'
import { Balance } from '@evm-ui/shared/ui/LargeTokenInput/Balance'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { q, type Range } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'
import { useRemoveCollateralForm } from '../hooks/useRemoveCollateralForm'
import { RemoveCollateralInfoList } from './RemoveCollateralInfoList'

export const RemoveCollateralForm = <ChainId extends IChainId>({
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
    userAddress,
    onSubmit,
    action,
    values,
    maxRemovable,
    positionCollateral,
    formErrors,
    collateralToken,
    borrowToken,
  } = useRemoveCollateralForm({ network, onPricesUpdated })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <RemoveCollateralInfoList
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
          label={t`Amount to Remove`}
          token={collateralToken}
          blockchainId={network.blockchainId}
          name="userCollateral"
          form={form}
          testId="remove-collateral-input"
          network={network}
          positionBalance={{ position: positionCollateral, tooltip: t`Collateral in position` }}
          max={{ ...q(maxRemovable), fieldName: 'maxCollateral' }}
          maxMessage={
            <Balance
              inline
              prefix={t`Max removable:`}
              tooltip={t`Max removable collateral`}
              symbol={collateralToken?.symbol}
              balance={q(maxRemovable)}
              onClick={() => form.update({ userCollateral: maxRemovable.data })}
            />
          }
        />
      </Stack>

      <FormAlerts
        error={action.error}
        formErrors={formErrors}
        handledErrors={['userCollateral']}
        userAddress={userAddress}
      />

      <FormButton
        pending={isPending}
        loading={!marketId}
        disabled={isDisabled}
        label={t`Remove collateral`}
        testId="remove-collateral-submit-button"
      />
    </Form>
  )
}
