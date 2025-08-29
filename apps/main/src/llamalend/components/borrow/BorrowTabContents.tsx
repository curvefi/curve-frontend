import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { LoanPreset, LoanPresetSelector } from '@/llamalend/components/borrow/LoanPresetSelector'
import { useBorrowForm } from '@/llamalend/components/borrow/useBorrowForm'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

function useLlamaMarket(market: MintMarketTemplate | LendMarketTemplate) {}

interface BorrowTabContentsProps {}

export const BorrowTabContents = ({
  chainId,
  market,
  network,
}: {
  chainId: IChainId
  market: MintMarketTemplate | LendMarketTemplate
  network: NetworkEnum
}) => {
  const { address: userAddress } = useAccount()
  const { values, onSubmit, isPending, maxBorrow, form, collateralToken, borrowToken } = useBorrowForm({
    market,
    chainId,
    network,
    userAddress,
  })
  const { maxDebt, maxTotalCollateral, maxLeverage } = maxBorrow.data ?? {}
  const [preset, setPreset] = useState<LoanPreset>(LoanPreset.MaxSafety)

  // const { collateralToken } = useLlamaMarket(market)
  // const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
  //   chainId: chainId,
  //   tokenAddress: market?.collateral,
  // })

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
            onBalance={(balance) => form.setValue('userBorrowed', balance)}
            isError={maxBorrow.isError}
            balanceDecimals={2}
          />
          {maxLeverage && (
            <Stack direction="row" justifyContent="space-between">
              <Stack>
                <FormControlLabel
                  label={t`Enable leverage`}
                  control={
                    <Checkbox
                      // todo: figure out how the range should work with leverage
                      checked={values.range < 50}
                      onChange={(x) => form.setValue('range', x.target.checked ? 10 : 50)}
                    />
                  }
                />
                <Typography variant="bodyXsRegular">{t`up to ${Math.floor(+maxLeverage)}🔥`}</Typography>
              </Stack>

              {/*todo: we don't want range here we want leverage */}
              <Input {...form.register('range')} endAdornment={'x'} />
            </Stack>
          )}

          <LoanPresetSelector preset={preset} onChange={setPreset} />

          <Button
            type="submit"
            loading={isPending}
            // todo: endIcon={<ChrevronDownIcon />}
          >
            {isPending ? t`Processing...` : t`Approve & Swap`}
          </Button>

          <Accordion ghost title={t`Health`} info="∞">
            <Stack>
              <ActionInfo label={t`Conversion Range`} value="$1,843.92 - $2,139.32" />
              <ActionInfo label={t`Borrow APY`} value="0.02%" prevValue="0.02%" />
              <ActionInfo label={t`LTV`} value="-" />
              <ActionInfo label={t`Collateral`} value="10.00 ETH" />
              <ActionInfo label={t`Bands Amount`} value="4" />
              <ActionInfo label={t`Additional slippage tolerance`} value="0.03%" />
              <ActionInfo label={t`Estimated tx cost`} value="~0.00 ETH" />
            </Stack>
          </Accordion>
        </Stack>
      </form>
    </FormProvider>
  )
}
