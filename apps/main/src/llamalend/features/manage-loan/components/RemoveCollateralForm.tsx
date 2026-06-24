import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import type { LlamaMarketType } from '@ui-kit/types/market'
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
  marketType,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  marketType: LlamaMarketType
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
  } = useRemoveCollateralForm({ market, network, onPricesUpdated })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
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
          marketType={marketType}
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
          maxMessage={
            <Balance
              inline
              prefix={t`Max removable:`}
              tooltip={t`Max removable collateral`}
              symbol={collateralToken?.symbol}
              balance={maxRemovable.data}
              loading={maxRemovable.isLoading}
              onClick={() => form.update({ userCollateral: maxRemovable.data })}
            />
          }
        />
      </Stack>

      <FormAlerts error={action.error} formErrors={formErrors} handledErrors={['userCollateral']} />

      <FormButton
        pending={isPending}
        loading={!market}
        disabled={isDisabled}
        label={t`Remove collateral`}
        testId="remove-collateral-submit-button"
      />
    </Form>
  )
}
