import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { q, type Range } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useRemoveCollateralForm } from '../hooks/useRemoveCollateralForm'
import { RemoveCollateralInfoList } from './RemoveCollateralInfoList'

export const RemoveCollateralForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  onPricesUpdated,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  enabled: boolean
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
    positionCollateral,
    formErrors,
    collateralToken,
    borrowToken,
  } = useRemoveCollateralForm({ market, network, onPricesUpdated, enabled })

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
          networks={networks}
          market={market}
        />
      }
    >
      <Stack>
        <LoanFormTokenInput
          label={t`Amount to Remove`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          testId="remove-collateral-input"
          network={network}
          positionBalance={{ position: positionCollateral, tooltip: t`Collateral in position` }}
          max={{ ...q(maxRemovable), fieldName: 'maxCollateral' }}
          message={`${t`Max removable:`} ${maxRemovable.data ?? '-'} ${collateralToken?.symbol}`}
        />
      </Stack>

      <FormAlerts error={action.error} formErrors={formErrors} handledErrors={['userCollateral']} />

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
