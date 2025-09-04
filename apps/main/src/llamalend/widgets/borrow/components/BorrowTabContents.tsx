import { FormProvider } from 'react-hook-form'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
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
import { LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

export const BorrowTabContents = ({
  market,
  network,
}: {
  market: LlamaMarketTemplate
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
    balances,
    collateralToken,
    borrowToken,
    isCreated,
    creationError,
    txHash,
    formErrors,
  } = useBorrowForm({ market, network, preset })
  const { maxDebt, maxTotalCollateral } = maxBorrow.data ?? {}
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} style={{ overflowWrap: 'break-word' }}>
        <Stack gap={Spacing.md}>
          <BorrowFormTokenInput
            label={t`Collateral`}
            token={collateralToken}
            name="userCollateral"
            form={form}
            state={maxBorrow}
            max={balances.data?.collateral ?? maxTotalCollateral}
            testId="borrow-collateral-input"
          />
          <BorrowFormTokenInput
            label={t`Borrow`}
            token={borrowToken}
            name="debt"
            form={form}
            state={maxBorrow}
            max={maxDebt}
            testId="borrow-debt-input"
          />

          <LoanPresetSelector
            preset={preset}
            setPreset={setPreset}
            setRange={(range: number) => form.setValue('range', range)}
          />

          <Button
            type="submit"
            loading={isPending}
            disabled={!form.formState.isValid}
            data-testid="borrow-submit-button"
            // todo: endIcon={<ChrevronDownIcon />}
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

          <BorrowActionInfoAccordion params={params} values={values} collateralToken={collateralToken} />
        </Stack>
      </form>
    </FormProvider>
  )
}
