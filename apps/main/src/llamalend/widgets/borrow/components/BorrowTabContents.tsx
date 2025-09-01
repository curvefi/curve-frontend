import { useMemo, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form/dist/types'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { BorrowForm, Token } from '@/llamalend/widgets/borrow/borrow.types'
import { AdvancedBorrowOptions } from '@/llamalend/widgets/borrow/components/AdvancedBorrowOptions'
import { BorrowActionInfoAccordion } from '@/llamalend/widgets/borrow/components/BorrowActionInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useBorrowForm } from '../useBorrowForm'
import { LoanPreset, LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

const TokenInput = ({
  label,
  token,
  name,
  max: balance,
  state: { isError, isLoading: isLoading },
  form,
}: {
  label: string
  token: Token | undefined
  state: { isError: boolean; isLoading: boolean }
  max: number | undefined
  name: keyof BorrowForm
  form: UseFormReturn<BorrowForm>
}) => (
  <LargeTokenInput
    name={name}
    label={label}
    tokenSelector={
      <TokenLabel
        blockchainId={token?.chain}
        tooltip={token?.symbol}
        address={token?.address}
        label={token?.symbol ?? '?'}
      />
    }
    onBalance={(v) => form.setValue(name, v)}
    isError={isError}
    balanceDecimals={2}
    maxBalance={useMemo(
      () => ({ balance, symbol: token?.symbol, loading: isLoading }),
      [balance, isLoading, token?.symbol],
    )}
  />
)

export const BorrowTabContents = ({
  chainId,
  market,
  network,
}: {
  chainId: IChainId
  market: MintMarketTemplate | LendMarketTemplate
  network: NetworkEnum
}) => {
  const { values, onSubmit, isPending, maxBorrow, params, form, balances, collateralToken, borrowToken } =
    useBorrowForm({
      market,
      chainId,
      network,
    })
  const { maxDebt, maxTotalCollateral } = maxBorrow.data ?? {}
  const [preset, setPreset] = useState<LoanPreset>()
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Stack gap={Spacing.md}>
          <TokenInput
            label={t`Collateral`}
            token={collateralToken}
            name="userCollateral"
            form={form}
            state={maxBorrow}
            max={balances.data?.collateral ?? maxTotalCollateral}
          />
          <TokenInput label={t`Borrow`} token={borrowToken} name="debt" form={form} state={maxBorrow} max={maxDebt} />
          <LoanPresetSelector
            preset={preset}
            setPreset={setPreset}
            setRange={(range: number) => form.setValue('range', range)}
          >
            {preset === LoanPreset.Advanced && (
              <AdvancedBorrowOptions
                network={network}
                params={params}
                values={values}
                collateralToken={collateralToken}
                borrowToken={borrowToken}
              />
            )}
          </LoanPresetSelector>

          <Button
            type="submit"
            loading={isPending}
            // todo: endIcon={<ChrevronDownIcon />}
          >
            {isPending ? t`Processing...` : t`Approve & Swap`}
          </Button>

          <BorrowActionInfoAccordion params={params} values={values} collateralToken={collateralToken} />
        </Stack>
      </form>
    </FormProvider>
  )
}
