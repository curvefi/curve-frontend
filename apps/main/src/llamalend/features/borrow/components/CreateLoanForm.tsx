import { useCallback, useEffect } from 'react'
import { LoanPreset } from '@/llamalend/constants'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { useCreateLoanPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/Balance'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { InputDivider } from '../../../widgets/InputDivider'
import { useCreateLoanForm } from '../hooks/useCreateLoanForm'
import { setValueOptions } from '../react-form.utils'
import { type CreateLoanFormExternalFields, type OnCreateLoanFormUpdate } from '../types'
import { AdvancedCreateLoanOptions } from './AdvancedCreateLoanOptions'
import { CreateLoanInfoAccordion } from './CreateLoanInfoAccordion'
import { LeverageInput } from './LeverageInput'
import { LoanPresetSelector } from './LoanPresetSelector'

/**
 * Hook to call the parent form to keep in sync with the chart and other components
 */
function useFormSync(
  { userCollateral, range, debt, userBorrowed, slippage, leverageEnabled }: CreateLoanFormExternalFields,
  onUpdate: OnCreateLoanFormUpdate,
) {
  useEffect(() => {
    void onUpdate({ userCollateral, debt, range, userBorrowed, slippage, leverageEnabled })
  }, [onUpdate, userCollateral, debt, range, userBorrowed, slippage, leverageEnabled])
}

/**
 * The form contents for the create loan tab.
 * @param market The market to create a loan.
 * @param network The network configuration.
 * @param onUpdate Callback to set the form values, so it's in sync with the ChartOhlc component.
 */
export const CreateLoanForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  onUpdate,
  onCreated,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  onUpdate: OnCreateLoanFormUpdate
  onCreated: CreateLoanOptions['onCreated']
}) => {
  const network = networks[chainId]
  const [preset, setPreset] = useCreateLoanPreset<LoanPreset>(LoanPreset.Safe)
  const {
    values,
    onSubmit,
    isPending,
    maxTokenValues,
    params,
    form,
    collateralToken,
    borrowToken,
    isCreated,
    creationError,
    txHash,
    formErrors,
    isApproved,
  } = useCreateLoanForm({ market, network, preset, onCreated })
  const setRange = useCallback(
    (range: number) => {
      // maxDebt is reset when query restarts, clear now to disable queries until recalculated
      form.setValue('maxDebt', undefined, setValueOptions)
      form.setValue('range', range, setValueOptions)
    },
    [form],
  )
  useFormSync(values, onUpdate)

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <CreateLoanInfoAccordion
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        <LoanFormTokenInput
          label={t`Collateral`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          max={{ ...maxTokenValues.collateral, fieldName: 'maxCollateral' }}
          testId="borrow-collateral-input"
          network={network}
        />
        <LoanFormTokenInput
          label={t`Borrow`}
          token={borrowToken}
          blockchainId={network.id}
          name="debt"
          form={form}
          max={{ ...maxTokenValues.debt, fieldName: 'maxDebt' }}
          testId="borrow-debt-input"
          network={network}
          message={
            <Balance
              prefix={t`Max borrow:`}
              tooltip={t`Max borrow`}
              symbol={borrowToken?.symbol}
              balance={values.maxDebt}
              loading={maxTokenValues.debt.isLoading}
              onClick={() => {
                form.setValue('debt', values.maxDebt, setValueOptions)
                void form.trigger('maxDebt') // re-validate maxDebt when debt changes
              }}
              buttonTestId="borrow-set-debt-to-max"
            />
          }
        />
      </Stack>

      {market && hasLeverage(market) && (
        <LeverageInput
          checked={values.leverageEnabled}
          form={form}
          params={params}
          maxLeverage={maxTokenValues.maxLeverage}
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

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={formErrors.length > 0}
        data-testid="create-loan-submit-button"
      >
        {isPending ? t`Processing...` : isApproved?.data ? t`Borrow` : t`Approve & Borrow`}
      </Button>

      <LoanFormAlerts
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
