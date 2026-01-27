import { BorrowMoreLoanInfoAccordion } from '@/llamalend/features/borrow/components/BorrowMoreLoanInfoAccordion'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { BorrowMoreOptions } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
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
  fromWallet = isDevelopment,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onBorrowedMore?: BorrowMoreOptions['onBorrowedMore']
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
  } = useBorrowMoreForm({
    market,
    network,
    enabled,
    onBorrowedMore,
  })

  console.log({ formErrors, values })
  const swapRequired = market && hasLeverage(market) && +(values.userBorrowed ?? 0) > 0
  const priceImpact = useBorrowMorePriceImpact(params, enabled && swapRequired)
  const fromBorrowed = fromWallet && market && hasLeverage(market)
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
          hasLeverage={market && hasLeverage(market)}
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
          label={t`Amount to Borrow`}
          token={borrowToken}
          blockchainId={network.id}
          name="debt"
          form={form}
          max={{ ...max.debt, fieldName: max.debt.field }}
          testId="borrow-more-input-debt"
          network={network}
          message={
            <Balance
              prefix={t`Max:`}
              tooltip={t`Maximum borrowable amount`}
              symbol={borrowToken?.symbol}
              balance={values.maxDebt}
              loading={max.debt.isLoading}
              onClick={() => form.setValue('debt', max.debt.data, setValueOptions)}
              buttonTestId="borrow-more-set-debt-to-max"
            />
          }
        />
      </Stack>

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
