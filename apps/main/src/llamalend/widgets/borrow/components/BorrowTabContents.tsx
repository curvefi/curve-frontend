import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
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

export const BorrowTabContents = ({
  chainId,
  market,
  network,
}: {
  chainId: IChainId
  market: MintMarketTemplate | LendMarketTemplate
  network: NetworkEnum
}) => {
  const { values, onSubmit, isPending, maxBorrow, params, form, collateralBalance, collateralToken, borrowToken } =
    useBorrowForm({
      market,
      chainId,
      network,
    })
  const { maxDebt, maxTotalCollateral } = maxBorrow.data ?? {}
  const [preset, setPreset] = useState<LoanPreset>(LoanPreset.MaxSafety)
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Stack gap={Spacing.md}>
          <LargeTokenInput
            label={t`Collateral`}
            tokenSelector={
              <TokenLabel
                blockchainId={collateralToken?.chain}
                tooltip={collateralToken?.symbol}
                address={collateralToken?.address}
                label={collateralToken?.symbol ?? '?'}
              />
            }
            onBalance={(balance) => form.setValue('userCollateral', balance)}
            isError={maxBorrow.isError}
            balanceDecimals={2}
            maxBalance={{ balance: collateralBalance ?? maxTotalCollateral, symbol: collateralToken?.symbol }}
          />
          <LargeTokenInput
            label={t`Borrow`}
            tokenSelector={
              <TokenLabel
                blockchainId={borrowToken?.chain}
                tooltip={borrowToken?.symbol}
                address={borrowToken?.address}
                label={borrowToken?.symbol ?? '?'}
              />
            }
            onBalance={(balance) => form.setValue('debt', balance)}
            isError={maxBorrow.isError}
            balanceDecimals={2}
            maxBalance={{ balance: maxDebt, symbol: borrowToken?.symbol }}
          />

          <LoanPresetSelector
            preset={preset}
            setPreset={setPreset}
            setRange={(range: number) => form.setValue('range', range)}
          />

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
