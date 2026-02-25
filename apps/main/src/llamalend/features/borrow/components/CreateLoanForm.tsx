import { type ChangeEvent, useCallback } from 'react'
import { LoanPreset } from '@/llamalend/constants'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import { useCreateLoanPriceImpact } from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { joinButtonText } from '@primitives/string.utils'
import { useCreateLoanPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { q, type Range } from '@ui-kit/types/util'
import type { Decimal } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { InputDivider } from '../../../widgets/InputDivider'
import { useCreateLoanForm } from '../hooks/useCreateLoanForm'
import { AdvancedCreateLoanOptions } from './AdvancedCreateLoanOptions'
import { CreateLoanInfoList } from './CreateLoanInfoList'
import { LeverageInput } from './LeverageInput'
import { LoanPresetSelector } from './LoanPresetSelector'

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
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  onSuccess: CreateLoanOptions['onSuccess']
}) => {
  const network = networks[chainId]
  const [preset, setPreset] = useCreateLoanPreset<LoanPreset>(LoanPreset.Safe)
  const {
    borrowToken,
    collateralToken,
    creationError,
    form,
    formErrors,
    isApproved,
    isCreated,
    isPending,
    isDisabled,
    maxTokenValues: { collateral: maxCollateral, debt: maxDebt, maxLeverage, setRange },
    onSubmit,
    params,
    txHash,
    values,
    leverage,
  } = useCreateLoanForm({ market, network, preset, onSuccess, onPricesUpdated })

  const toggleLeverage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => updateForm(form, { leverageEnabled: event.target.checked }),
    [form],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <CreateLoanInfoList
          form={form}
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          onSlippageChange={(value) => updateForm(form, { slippage: value })}
        />
      }
      data-testid="create-loan-form"
    >
      <Stack divider={<InputDivider />}>
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
          message={
            <Balance
              prefix={t`Max borrow:`}
              tooltip={t`Max borrow`}
              symbol={borrowToken?.symbol}
              balance={values.maxDebt}
              loading={maxDebt.isLoading}
              onClick={useCallback(() => updateForm(form, { debt: values.maxDebt }), [form, values.maxDebt])}
              buttonTestId="borrow-set-debt-to-max"
            />
          }
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

      <HighPriceImpactAlert {...q(useCreateLoanPriceImpact(params, values.leverageEnabled))} />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid="create-loan-submit-button"
      >
        {isPending ? t`Processing...` : joinButtonText(isApproved?.data === false && t`Approve`, t`Borrow`)}
      </Button>

      <FormAlerts
        isSuccess={isCreated}
        error={creationError}
        formErrors={formErrors}
        network={network}
        txHash={txHash}
        handledErrors={['userCollateral', 'debt', 'maxDebt']}
        successTitle={t`Loan created`}
      />
    </Form>
  )
}
