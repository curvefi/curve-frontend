import { useCallback, useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import type { CreateLoanOptions } from '@/llamalend/features/borrow/queries/create-loan.mutation'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useBorrowPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { setValueOptions } from '../react-form.utils'
import { type BorrowFormExternalFields, BorrowPreset, type OnBorrowFormUpdate } from '../types'
import { useBorrowForm } from '../useBorrowForm'
import { AdvancedBorrowOptions } from './AdvancedBorrowOptions'
import { BorrowActionInfoAccordion } from './BorrowActionInfoAccordion'
import { BorrowFormAlert } from './BorrowFormAlert'
import { BorrowFormTokenInput } from './BorrowFormTokenInput'
import { InputDivider } from './InputDivider'
import { LeverageInput } from './LeverageInput'
import { LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

/**
 * Hook to call the parent form to keep in sync with the chart and other components
 */
function useFormSync(
  { userCollateral, range, debt, userBorrowed, slippage, leverageEnabled }: BorrowFormExternalFields,
  onUpdate: OnBorrowFormUpdate,
) {
  useEffect(() => {
    void onUpdate({ userCollateral, debt, range, userBorrowed, slippage, leverageEnabled })
  }, [onUpdate, userCollateral, debt, range, userBorrowed, slippage, leverageEnabled])
}

/**
 * The contents of the Borrow tab, including the form and all related components.
 * @param market The market to borrow from.
 * @param network The network configuration.
 * @param onUpdate Callback to set the form values, so it's in sync with the ChartOhlc component.
 */
export const BorrowTabContents = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  onUpdate,
  onCreated,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  onUpdate: OnBorrowFormUpdate
  onCreated: CreateLoanOptions['onCreated']
}) => {
  const network = networks[chainId]
  const [preset, setPreset] = useBorrowPreset<BorrowPreset>(BorrowPreset.Safe)
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
    tooMuchDebt,
    isApproved,
  } = useBorrowForm({ market, network, preset, onCreated })
  const setRange = useCallback((range: number) => form.setValue('range', range, setValueOptions), [form])
  useFormSync(values, onUpdate)

  const marketHasLeverage = market && hasLeverage(market)
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
        <Stack gap={Spacing.md}>
          <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
            <AppFormContentWrapper>
              <Stack gap={Spacing.md}>
                <Stack divider={<InputDivider />}>
                  <BorrowFormTokenInput
                    label={t`Collateral`}
                    token={collateralToken}
                    blockchainId={network.id}
                    name="userCollateral"
                    form={form}
                    isLoading={maxTokenValues.isCollateralLoading}
                    isError={maxTokenValues.isCollateralError}
                    max={values.maxCollateral}
                    testId="borrow-collateral-input"
                    network={network}
                  />
                  <BorrowFormTokenInput
                    label={t`Borrow`}
                    token={borrowToken}
                    blockchainId={network.id}
                    name="debt"
                    form={form}
                    isLoading={maxTokenValues.isDebtLoading}
                    isError={maxTokenValues.isDebtError}
                    max={values.maxDebt}
                    testId="borrow-debt-input"
                    network={network}
                  />
                </Stack>

                {marketHasLeverage && (
                  <LeverageInput
                    leverageEnabled={values.leverageEnabled}
                    form={form}
                    params={params}
                    maxLeverage={maxTokenValues.maxLeverage}
                    isError={maxTokenValues.isLeverageError}
                    isLoading={maxTokenValues.isLeverageLoading}
                  />
                )}

                <LoanPresetSelector preset={preset} setPreset={setPreset} setRange={setRange}>
                  <Collapse in={preset === BorrowPreset.Custom}>
                    <AdvancedBorrowOptions
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
                  data-testid="borrow-submit-button"
                >
                  {isPending ? t`Processing...` : isApproved ? t`Borrow` : t`Approve & Borrow`}
                </Button>

                <BorrowFormAlert
                  isCreated={isCreated}
                  creationError={creationError}
                  formErrors={formErrors}
                  network={network}
                  txHash={txHash}
                />
              </Stack>
            </AppFormContentWrapper>
          </Stack>

          <BorrowActionInfoAccordion
            params={params}
            values={values}
            collateralToken={collateralToken}
            borrowToken={borrowToken}
            tooMuchDebt={tooMuchDebt}
            networks={networks}
            onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
          />
        </Stack>
      </form>
    </FormProvider>
  )
}
