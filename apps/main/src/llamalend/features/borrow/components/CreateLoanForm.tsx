import { type ChangeEvent, useCallback } from 'react'
import { useConnection } from 'wagmi'
import { LoanPreset, LEVERAGE } from '@/llamalend/constants'
import { hasLeverage, type MarketTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { joinButtonText } from '@primitives/string.utils'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { useCreateLoanPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { q, type Range } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useCreateLoanForm } from '../hooks/useCreateLoanForm'
import { AdvancedCreateLoanOptions } from './AdvancedCreateLoanOptions'
import { CreateLoanInfoList } from './CreateLoanInfoList'
import { HighLiquidationRiskAlert } from './HighLiquidationRiskAlert'
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
  marketId,
  ammAddress,
  zapAddress,
  controllerAddress,
  tokens,
  minBands,
  maxBands,
  networks,
  chainId,
  onPricesUpdated,
  marketType,
}: {
  market: LlamaMarketTemplate | undefined
  marketId: string | undefined
  ammAddress: Address | undefined
  zapAddress: Address | undefined
  controllerAddress: Address | undefined
  tokens: Partial<MarketTokens>
  minBands: number | undefined
  maxBands: number | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  marketType: LlamaMarketType
}) => {
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
  } = useCreateLoanForm({
    market,
    marketId,
    ammAddress,
    zapAddress,
    controllerAddress,
    tokens,
    marketType,
    networks,
    chainId,
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
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
            minBands={minBands}
            maxBands={maxBands}
            values={values}
            params={params}
            setRange={setRange}
            network={network.id}
            collateralToken={collateralToken}
            borrowToken={borrowToken}
          />
        </Collapse>
      </LoanPresetSelector>
      <HighPriceImpactAlert priceImpact={priceImpact} values={values} max={q(maxLeverage)} slippageType={LEVERAGE} />
      <HighLiquidationRiskAlert isHighLiquidationRisk={isHighLiquidationRisk} />
      {isConnected ? (
        disabledAlert ? (
          <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>
        ) : (
          <Button type="submit" loading={isLoading} disabled={isDisabled} data-testid="create-loan-submit-button">
            {isPending ? t`Processing...` : joinButtonText(isApproved?.data === false && t`Approve`, t`Borrow`)}
          </Button>
        )
      ) : (
        <ConnectWalletButton />
      )}
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
