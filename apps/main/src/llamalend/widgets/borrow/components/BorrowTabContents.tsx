import { FormProvider } from 'react-hook-form'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import { setValueOptions } from '@/llamalend/widgets/borrow/borrow.util'
import { AdvancedBorrowOptions } from '@/llamalend/widgets/borrow/components/AdvancedBorrowOptions'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { BaseConfig } from '@ui/utils'
import { useBorrowPreset } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowPreset, type LlamaMarketTemplate } from '../borrow.types'
import { useBorrowForm } from '../useBorrowForm'
import { BorrowActionInfoAccordion } from './BorrowActionInfoAccordion'
import { BorrowFormAlert } from './BorrowFormAlert'
import { BorrowFormTokenInput } from './BorrowFormTokenInput'
import { InputDivider } from './InputDivider'
import { LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

export const BorrowTabContents = ({
  market,
  network,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<NetworkEnum, IChainId>
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
  const setRange = (range: number) => form.setValue('range', range, setValueOptions)

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

          <Box
            // this box wraps around the accordion and makes it look like the accordion is out of the tab
            // in the future we could move the info out of the card, but this is simpler during refactoring the old page
            sx={{
              backgroundColor: 'var(--page--background-color)',
              marginInline: 'calc(-1 * var(--spacing-3))',
              marginBlockEnd: 'calc(-1 * var(--spacing-3))',
              paddingBlockStart: 'var(--spacing-3)',
              position: 'relative',
            }}
          >
            <BorrowActionInfoAccordion
              params={params}
              values={values}
              collateralToken={collateralToken}
              tooMuchDebt={tooMuchDebt}
              onSlippageChange={(value) => form.setValue('slippage', +value, setValueOptions)}
            />
          </Box>
        </Stack>
      </form>
    </FormProvider>
  )
}
