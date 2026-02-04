import { type ChangeEvent, useCallback } from 'react'
import { BorrowMoreLoanInfoAccordion } from '@/llamalend/features/borrow/components/BorrowMoreLoanInfoAccordion'
import { LeverageInput } from '@/llamalend/features/borrow/components/LeverageInput'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { OnBorrowedMore } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import {
  isLeverageBorrowMore,
  isLeverageBorrowMoreSupported,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { HighPriceImpactAlert, LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { isDevelopment } from '@ui-kit/utils'
import { setValueOptions } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { InputDivider } from '../../../widgets/InputDivider'
import { useBorrowMoreForm } from '../hooks/useBorrowMoreForm'

export const BorrowMoreForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onBorrowedMore,
  fromWallet = isDevelopment, // todo: delete this if users do not complain about it, for now dev-only feature
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onBorrowedMore?: OnBorrowedMore
  fromWallet?: boolean
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
    health,
    leverage,
  } = useBorrowMoreForm({
    market,
    network,
    enabled,
    onBorrowedMore,
  })

  const isLeverageEnabled = isLeverageBorrowMore(market, values.leverageEnabled)
  const swapRequired = isLeverageEnabled && Number(values.userBorrowed) > 0
  const priceImpact = useBorrowMorePriceImpact(params, enabled && swapRequired)
  const fromBorrowed = fromWallet && isLeverageEnabled
  const onLeverageToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => form.setValue('leverageEnabled', event.target.checked),
    [form],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <BorrowMoreLoanInfoAccordion
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
          leverageEnabled={values.leverageEnabled}
          health={health}
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
              onClick={() => {
                form.setValue('debt', max.debt.data, setValueOptions)
                void form.trigger('maxDebt') // re-validate max
              }}
            />
          }
        />
      </Stack>

      {isLeverageBorrowMoreSupported(market) && (
        <LeverageInput
          checked={values.leverageEnabled}
          leverage={leverage}
          onToggle={onLeverageToggle}
          maxLeverage={max.maxLeverage}
        />
      )}

      <HighPriceImpactAlert priceImpact={priceImpact.data} isLoading={priceImpact.isLoading} />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid="borrow-more-submit-button"
      >
        {isPending ? t`Processing...` : notFalsy(isApproved?.data === false && t`Approve`, t`Borrow More`).join(' & ')}
      </Button>

      <LoanFormAlerts
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
