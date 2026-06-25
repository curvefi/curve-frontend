import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { q, type Range } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useAddCollateralForm } from '../hooks/useAddCollateralForm'
import { AddCollateralInfoList } from './AddCollateralInfoList'

export const AddCollateralForm = <ChainId extends IChainId>({
  market,
  marketId,
  controllerAddress,
  tokens,
  networks,
  chainId,
  onPricesUpdated,
  marketType,
}: {
  market: LlamaMarketTemplate | undefined
  marketId: string | undefined
  controllerAddress: Address | undefined
  tokens: MarketTokensOrEmpty
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
    isApproved,
    formErrors,
    collateralToken,
    borrowToken,
    maxCollateral,
  } = useAddCollateralForm({ market, marketId, tokens, network, onPricesUpdated })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      onSubmit={onSubmit}
      footer={
        <AddCollateralInfoList
          form={form}
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          controllerAddress={controllerAddress}
          marketType={marketType}
        />
      }
    >
      <Stack>
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
