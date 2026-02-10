import { RepayLoanInfoAccordion } from '@/llamalend/features/borrow/components/RepayLoanInfoAccordion'
import { useRepayForm } from '@/llamalend/features/manage-loan/hooks/useRepayForm'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/action-card/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { setValueOptions } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { AlertRepayDebtToIncreaseHealth } from '../alerts/AlertRepayDebtToIncreaseHealth'
import { ButtonGetCrvUsd } from '../ButtonGetCrvUsd'

const { Spacing } = SizesAndSpaces

export const ImproveHealthForm = ({
  market,
  networks,
  chainId,
  enabled,
  onRepaid,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<LlamaChainId>
  chainId: LlamaChainId
  enabled?: boolean
  onRepaid?: RepayOptions['onRepaid']
}) => {
  const network = networks[chainId]
  const {
    form,
    values,
    params,
    isPending,
    onSubmit,
    borrowToken,
    collateralToken,
    isRepaid,
    repayError,
    txHash,
    isApproved,
    formErrors,
    max: { userBorrowed: maxRepay },
    isFull: { data: isFull },
  } = useRepayForm({
    market,
    network,
    enabled,
    onRepaid,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <RepayLoanInfoAccordion
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
          hasLeverage={market && hasLeverage(market)}
          swapRequired={false}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Debt to repay`}
        token={borrowToken}
        blockchainId={network.id}
        name="userBorrowed"
        form={form}
        max={{ ...maxRepay, fieldName: maxRepay.field }}
        testId="improve-health-input-debt"
        network={network}
        onValueChange={(v) => {
          form.setValue('isFull', v === form.getValues('maxBorrowed'), setValueOptions)
        }}
        message={
          <Balance
            prefix={t`Max repay amount:`}
            tooltip={t`Max available to repay`}
            symbol={borrowToken?.symbol}
            balance={maxRepay.data}
            loading={maxRepay.isLoading}
            onClick={() => {
              form.setValue('userBorrowed', maxRepay.data, setValueOptions)
              form.setValue('isFull', true, setValueOptions)
              void form.trigger(maxRepay.field)
            }}
          />
        }
      />

      <AlertRepayDebtToIncreaseHealth />

      <Stack gap={Spacing.xs}>
        <Button type="submit" loading={isPending} disabled={formErrors.length > 0} data-testid="improve-health-submit">
          {isPending
            ? t`Processing...`
            : notFalsy(
                isApproved?.data === false && t`Approve`,
                t`Repay debt & ${isFull ? 'close position' : 'increase health'}`,
              ).join(' & ')}
        </Button>

        <ButtonGetCrvUsd />
      </Stack>

      <LoanFormAlerts
        isSuccess={isRepaid}
        error={repayError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={notFalsy('userBorrowed', maxRepay.field)}
        successTitle={t`Loan repaid`}
      />
    </Form>
  )
}
