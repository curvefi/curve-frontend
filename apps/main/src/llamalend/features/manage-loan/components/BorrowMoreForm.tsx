import { type ChangeEvent, useCallback, useEffect } from 'react'
import { BorrowMoreLoanInfoList } from '@/llamalend/features/borrow/components/BorrowMoreLoanInfoList'
import { LeverageInput } from '@/llamalend/features/borrow/components/LeverageInput'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { OnBorrowedMore } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import {
  isLeverageBorrowMore,
  isLeverageBorrowMoreSupported,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { q } from '@ui-kit/types/util'
import { isDevelopment, joinButtonText } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts, HighPriceImpactAlert } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { InputDivider } from '../../../widgets/InputDivider'
import { useBorrowMoreForm } from '../hooks/useBorrowMoreForm'

const useFormSync = (
  params: BorrowMoreParams,
  enabled: boolean | undefined,
  onPricesUpdated: (prices: string[] | undefined) => void,
) => {
  const { data } = useBorrowMorePrices(params, enabled)
  useEffect(() => {
    onPricesUpdated(data)
  }, [onPricesUpdated, data])
}

export const BorrowMoreForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onBorrowedMore,
  fromWallet = isDevelopment, // todo: delete this if users do not complain about it, for now dev-only feature
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onBorrowedMore?: OnBorrowedMore
  fromWallet?: boolean
  onPricesUpdated: (prices: string[] | undefined) => void
}) => {
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    onSubmit,
    isDisabled,
    borrowToken,
    collateralToken,
    isBorrowed,
    borrowError,
    txHash,
    isApproved,
    formErrors,
    max,
    leverage,
  } = useBorrowMoreForm({
    market,
    network,
    enabled,
    onBorrowedMore,
  })

  const isLeverageEnabled = isLeverageBorrowMore(market, values.leverageEnabled)
  const swapRequired = isLeverageEnabled && Number(values.userBorrowed) > 0
  const fromBorrowed = fromWallet && isLeverageEnabled
  const onLeverageToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => updateForm(form, { leverageEnabled: event.target.checked }),
    [form],
  )

  useFormSync(params, enabled, onPricesUpdated)

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <BorrowMoreLoanInfoList
          form={form}
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={(value) => updateForm(form, { slippage: value })}
          leverageEnabled={values.leverageEnabled}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        {fromWallet && (
          <LoanFormTokenInput
            label={t`Add from wallet`}
            token={collateralToken}
            blockchainId={network.id}
            name="userCollateral"
            form={form}
            max={{ ...max.userCollateral, fieldName: max.userCollateral.field }}
            testId="borrow-more-input-collateral"
            network={network}
          />
        )}
        {fromBorrowed && (
          <LoanFormTokenInput
            label={t`Add borrowed from wallet`}
            token={borrowToken}
            blockchainId={network.id}
            name="userBorrowed"
            form={form}
            max={{ ...max.userBorrowed, fieldName: max.userBorrowed.field }}
            testId="borrow-more-input-user-borrowed"
            network={network}
          />
        )}

        <LoanFormTokenInput
          label={t`Amount to borrow`}
          token={borrowToken}
          blockchainId={network.id}
          name="debt"
          form={form}
          max={{ ...max.debt, fieldName: max.debt.field }}
          testId="borrow-more-input-debt"
          network={network}
          hideBalance
          message={
            <Balance
              prefix={t`Max borrow amount:`}
              tooltip={t`Max available to borrow`}
              symbol={borrowToken?.symbol}
              balance={max.debt.data}
              loading={max.debt.isLoading}
              onClick={() => updateForm(form, { debt: max.debt.data })}
            />
          }
        />
      </Stack>

      {isLeverageBorrowMoreSupported(market) && (
        <LeverageInput
          checked={values.leverageEnabled}
          leverage={leverage}
          onToggle={onLeverageToggle}
          maxLeverage={max.maxLeverage.data}
        />
      )}

      <HighPriceImpactAlert {...q(useBorrowMorePriceImpact(params, enabled && swapRequired))} />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid="borrow-more-submit-button"
        data-validation={JSON.stringify({
          hasMarket: !!market,
          swapRequired,
          isPending,
          isDisabled,
          isValid: form.formState.isValid,
          isSubmitting: form.formState.isSubmitting,
          isApproved: q(isApproved),
          formErrors,
          rawFormErrors: Object.entries(form.formState.errors),
          dirtyFields: form.formState.dirtyFields,
        })}
      >
        {isPending ? t`Processing...` : joinButtonText(isApproved?.data === false && t`Approve`, t`Borrow More`)}
      </Button>

      <FormAlerts
        isSuccess={isBorrowed}
        error={borrowError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={notFalsy(
          fromWallet && 'userCollateral',
          fromWallet && max.userCollateral.field,
          fromBorrowed && 'userBorrowed',
          fromBorrowed && max.userBorrowed.field,
          'debt',
          max.debt.field,
        )}
        successTitle={t`Borrowed more successfully`}
      />
    </Form>
  )
}
