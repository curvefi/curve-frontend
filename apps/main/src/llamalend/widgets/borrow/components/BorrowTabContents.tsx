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
import { hasLeverage } from '../borrow.util'
import { useBorrowForm } from '../useBorrowForm'
import { AdvancedBorrowOptions } from './AdvancedBorrowOptions'
import { BorrowActionInfoAccordion } from './BorrowActionInfoAccordion'
import { BorrowFormAlert } from './BorrowFormAlert'
import { BorrowFormTokenInput } from './BorrowFormTokenInput'
import { LeverageInput } from './LeverageInput'
import { LoanPresetSelector } from './LoanPresetSelector'

const { Spacing } = SizesAndSpaces

export const BorrowTabContents = ({
  chainId,
  market,
  network,
}: {
  chainId: IChainId
  market: LlamaMarketTemplate
  network: BaseConfig<NetworkEnum>
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
  } = useBorrowForm({ market, chainId, network, preset })
  const { maxDebt, maxTotalCollateral, maxLeverage } = maxBorrow.data ?? {}
  const { leverage } = values
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
          />
          <BorrowFormTokenInput
            label={t`Borrow`}
            token={borrowToken}
            name="debt"
            form={form}
            state={maxBorrow}
            max={maxDebt}
          />

          {hasLeverage(market) && <LeverageInput maxLeverage={maxLeverage} leverage={leverage} form={form} />}

          <LoanPresetSelector
            preset={preset}
            setPreset={setPreset}
            setRange={(range: number) => form.setValue('range', range)}
          >
            {preset === BorrowPreset.Custom && (
              <AdvancedBorrowOptions
                network={network.id}
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

          <BorrowFormAlert isCreated={isCreated} creationError={creationError} network={network} txHash={txHash} />

          <BorrowActionInfoAccordion params={params} values={values} collateralToken={collateralToken} />
        </Stack>
      </form>
    </FormProvider>
  )
}
