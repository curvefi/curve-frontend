import { type ChangeEvent, useCallback } from 'react'
import { LoanPreset } from '@/llamalend/constants'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { FormDisabledAlert, LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { joinButtonText } from '@primitives/string.utils'
import { useCreateLoanPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q, type Range } from '@ui-kit/types/util'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useCreateLoanForm } from '../hooks/useCreateLoanForm'
import { AdvancedCreateLoanOptions } from './AdvancedCreateLoanOptions'
import { CreateLoanInfoList } from './CreateLoanInfoList'
import { LeverageInput } from './LeverageInput'
import { LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

/**
 * The form contents for the create loan tab.
 * @param market The market to create a loan.
 * @param network The network configuration.
 * @param onPricesUpdated Callback to sync liquidation prices with the chart.
 */
export const CreateLoanForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  onPricesUpdated,
  borrowDisabledAlert,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  borrowDisabledAlert?: FormDisabledAlert
}) => {
  const network = networks[chainId]
  const [preset, setPreset] = useCreateLoanPreset<LoanPreset>(LoanPreset.Safe)
  const {
    borrowToken,
    collateralToken,
    error,
    form,
    formErrors,
    isApproved,
    isPending,
    isLoading,
    isDisabled,
    maxTokenValues: { collateral: maxCollateral, debt: maxDebt, maxLeverage, setRange },
    onSubmit,
    disabledAlert,
    lowSolvencyModalProps,
    params,
    routes,
    values,
    leverage,
    priceImpact,
  } = useCreateLoanForm({
    market,
    network,
    preset,
    onPricesUpdated,
    borrowDisabledAlert,
  })

  const toggleLeverage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      updateForm(form, { leverageEnabled: event.target.checked, routeId: undefined }),
    [form],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <CreateLoanInfoList
          market={market}
          form={form}
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          routes={routes}
          onSlippageChange={value => updateForm(form, { slippage: value })}
        />
      }
      data-testid="create-loan-form"
    >
      <Stack gap={Spacing.xs}>
        <LoanFormTokenInput
          label={t`Collateral`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          max={{ ...q(maxCollateral), fieldName: 'maxCollateral' }}
          testId="borrow-collateral-input"
          network={network}
        />
        <LoanFormTokenInput
          label={t`Borrow`}
          token={borrowToken}
          blockchainId={network.id}
          name="debt"
          form={form}
          max={{ ...q(maxDebt), fieldName: 'maxDebt' }}
          hideBalance
          testId="borrow-debt-input"
          network={network}
          message={`${t`Max borrow:`} ${values.maxDebt ?? '-'} ${borrowToken?.symbol}`}
        />
      </Stack>

      {!!market && hasLeverage(market) && (
        <LeverageInput
          checked={values.leverageEnabled}
          leverage={leverage}
          onToggle={toggleLeverage}
          maxLeverage={maxLeverage.data}
        />
      )}

      <LoanPresetSelector preset={preset} setPreset={setPreset} setRange={setRange}>
        <Collapse in={preset === LoanPreset.Custom}>
          <AdvancedCreateLoanOptions
            market={market}
            values={values}
            params={params}
            setRange={setRange}
            network={network.id}
            collateralToken={collateralToken}
            borrowToken={borrowToken}
          />
        </Collapse>
      </LoanPresetSelector>

      <HighPriceImpactAlert priceImpact={priceImpact} values={values} max={q(maxLeverage)} />

      {disabledAlert ? (
        <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>
      ) : (
        <Button type="submit" loading={isLoading} disabled={isDisabled} data-testid="create-loan-submit-button">
          {isPending ? t`Processing...` : joinButtonText(isApproved?.data === false && t`Approve`, t`Borrow`)}
        </Button>
      )}

      <LowSolvencyActionModal {...lowSolvencyModalProps} />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['userCollateral', 'debt', 'maxDebt']} />
    </Form>
  )
}
