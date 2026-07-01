import { type ChangeEvent, useCallback } from 'react'
import { useConnection } from 'wagmi'
import { LoanPreset, LEVERAGE } from '@/llamalend/constants'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { FormButton } from '@ui-kit/features/forms'
import { useCreateLoanPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q, type Range } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useMarketContext } from '../../market-context'
import { useCreateLoanForm } from '../hooks/useCreateLoanForm'
import { AdvancedCreateLoanOptions } from './AdvancedCreateLoanOptions'
import { CreateLoanInfoList } from './CreateLoanInfoList'
import { HighLiquidationRiskAlert } from './HighLiquidationRiskAlert'
import { LeverageInput } from './LeverageInput'
import { LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

/**
 * The form contents for the create loan tab.
 * @param network The network configuration.
 * @param onPricesUpdated Callback to sync liquidation prices with the chart.
 */
export const CreateLoanForm = <ChainId extends IChainId>({
  networks,
  onPricesUpdated,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) => {
  const { chainId, controllerAddress, bands, marketType } = useMarketContext<ChainId>()
  const { isConnected } = useConnection()
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
    params,
    routes,
    values,
    leverage,
    priceImpact,
    solvencyModal: { onConfirm, onClose, isOpen },
    isHighLiquidationRisk,
    isLeverageSupported,
  } = useCreateLoanForm({
    networks,
    preset,
    onPricesUpdated,
  })

  const { update: updateForm } = form
  const toggleLeverage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => updateForm({ leverageEnabled: event.target.checked, routeId: undefined }),
    [updateForm],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <CreateLoanInfoList
          marketType={marketType}
          controllerAddress={controllerAddress}
          form={form}
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          routes={routes}
          onSlippageChange={value => updateForm({ slippage: value })}
        />
      }
      data-testid="create-loan-form"
    >
      <Stack sx={{ gap: Spacing.xs }}>
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
          maxMessage={
            <Balance
              inline
              prefix={t`Max borrow:`}
              tooltip={t`Max borrow`}
              symbol={borrowToken?.symbol}
              balance={maxDebt.data}
              loading={isConnected && maxDebt.isLoading}
              onClick={useCallback(() => updateForm({ debt: values.maxDebt }), [updateForm, values.maxDebt])}
              buttonTestId="borrow-set-debt-to-max"
            />
          }
        />
      </Stack>
      {isLeverageSupported && (
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
            minBands={bands.minBands}
            maxBands={bands.maxBands}
            values={values}
            setRange={setRange}
          />
        </Collapse>
      </LoanPresetSelector>
      <HighPriceImpactAlert priceImpact={priceImpact} values={values} max={q(maxLeverage)} slippageType={LEVERAGE} />
      <HighLiquidationRiskAlert isHighLiquidationRisk={isHighLiquidationRisk} />
      <FormButton
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={[isApproved?.data === false && t`Approve`, t`Borrow`]}
        testId="create-loan-submit-button"
        connectWalletTestId="form-connect-wallet"
      >
        {disabledAlert && <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>}
      </FormButton>
      <LowSolvencyActionModal
        action="borrow"
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        tokenSymbol={collateralToken?.symbol}
      />
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['userCollateral', 'debt', 'maxDebt']} />
    </Form>
  )
}
