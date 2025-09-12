import { useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { BaseConfig } from '@ui/utils'
import { useBorrowPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowPreset, type LlamaMarketTemplate, type OnBorrowFormUpdate } from '../borrow.types'
import { setValueOptions } from '../llama.util'
import { useBorrowForm } from '../useBorrowForm'
import { AdvancedBorrowOptions } from './AdvancedBorrowOptions'
import { BorrowActionInfoAccordion } from './BorrowActionInfoAccordion'
import { BorrowFormAlert } from './BorrowFormAlert'
import { BorrowFormTokenInput } from './BorrowFormTokenInput'
import { InputDivider } from './InputDivider'
import { LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

/**
 * The contents of the Borrow tab, including the form and all related components.
 * @param market The market to borrow from.
 * @param network The network configuration.
 * @param onUpdate Callback to set the form values, so it's in sync with the ChartOhlc component.
 */
export const BorrowTabContents = ({
  market,
  network,
  onUpdate,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<NetworkEnum, IChainId>
  onUpdate: OnBorrowFormUpdate
}) => {
  const [preset, setPreset] = useBorrowPreset<BorrowPreset>(BorrowPreset.Safe)
  const {
    values,
    onSubmit,
    isPending,
    maxBorrow,
    params,
    form,
    collateralToken,
    borrowToken,
    isCreated,
    creationError,
    txHash,
    maxDebt,
    maxCollateral,
    formErrors,
    tooMuchDebt,
    tooMuchCollateral,
  } = useBorrowForm({ market, network, preset })
  const setRange = useCallback((range: number) => form.setValue('range', range, setValueOptions), [form])

  const { userCollateral, range, debt } = values
  useEffect(
    // callback the parent form to keep in sync with the chart and other components
    () => void onUpdate({ userCollateral, debt, range }).then(() => {}),
    [onUpdate, userCollateral, debt, range],
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
        <Stack gap={Spacing.md}>
          <Stack divider={<InputDivider />}>
            <BorrowFormTokenInput
              label={t`Collateral`}
              token={collateralToken}
              name="userCollateral"
              form={form}
              isLoading={maxBorrow.isLoading || !market}
              isError={maxBorrow.isError || tooMuchCollateral}
              max={maxCollateral}
              testId="borrow-collateral-input"
            />
            <BorrowFormTokenInput
              label={t`Borrow`}
              token={borrowToken}
              name="debt"
              form={form}
              isLoading={maxBorrow.isLoading || !market}
              isError={maxBorrow.isError || tooMuchDebt}
              max={maxDebt}
              testId="borrow-debt-input"
            />
          </Stack>

          <LoanPresetSelector preset={preset} setPreset={setPreset} setRange={setRange}>
            <Collapse in={preset === BorrowPreset.Custom}>
              <AdvancedBorrowOptions
                market={market}
                values={values}
                params={params}
                setRange={setRange}
                enabled={preset === BorrowPreset.Custom}
              />
            </Collapse>
          </LoanPresetSelector>

          <Button
            type="submit"
            loading={isPending || !market}
            disabled={formErrors.length > 0}
            data-testid="borrow-submit-button"
          >
            {isPending ? t`Processing...` : t`Approve & Swap`}
          </Button>

          <BorrowFormAlert
            isCreated={isCreated}
            creationError={creationError}
            formErrors={formErrors}
            network={network}
            txHash={txHash}
          />

          <OutOfCardBox>
            <BorrowActionInfoAccordion
              params={params}
              values={values}
              collateralToken={collateralToken}
              tooMuchDebt={tooMuchDebt}
              onSlippageChange={(value) => form.setValue('slippage', +value, setValueOptions)}
            />
          </OutOfCardBox>
        </Stack>
      </form>
    </FormProvider>
  )
}

/**
 * A box that visually breaks out of the card/tab it's contained in.
 * Used to wrap the accordion at the bottom of the borrow form.
 * We should move the accordion out of the card later, this is simpler during refactoring the old page
 */
export const OutOfCardBox = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      // we use the legacy variables to match what the parent <AppFormContentWrapper> is using
      backgroundColor: 'var(--page--background-color)',
      marginInline: 'calc(-1 * var(--spacing-3))',
      marginBlockEnd: 'calc(-1 * var(--spacing-3))',
      paddingBlockStart: 'var(--spacing-3)',
      position: 'relative',
    }}
  >
    {children}
  </Box>
)
