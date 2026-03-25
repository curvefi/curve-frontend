import { noop } from 'lodash'
import { RepayLoanInfoList } from '@/llamalend/features/borrow/components/RepayLoanInfoList'
import { useRepayForm } from '@/llamalend/features/manage-loan/hooks/useRepayForm'
import { hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { useUserPrices } from '@/llamalend/queries/user'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { joinButtonText } from '@primitives/string.utils'
import { t } from '@ui-kit/lib/i18n'
import { Balance } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { AlertRepayDebtToIncreaseHealth } from '../alerts/AlertRepayDebtToIncreaseHealth'
import { ButtonGetCrvUsd } from '../ButtonGetCrvUsd'

const { Spacing } = SizesAndSpaces

/**
 * Form to repay debt to increase health in soft liquidation. Similar to RepayForm, but with some differences:
 * - No token selection, since only the borrow token can be repaid to increase health
 * - No price impact or swap info, since no swap is involved in improving health
 * - Different info list component that focuses on health improvement details rather than general repay details
 */
export const ImproveHealthForm = ({
  market,
  networks,
  chainId,
  enabled,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<LlamaChainId>
  chainId: LlamaChainId
  enabled?: boolean
  onSuccess?: RepayOptions['onSuccess']
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
    routes,
    isDisabled,
  } = useRepayForm({
    market,
    network,
    enabled,
    onSuccess,
    onPricesUpdated: noop, // liquidation prices do not change when in liquidation protection
  })

  const userPrices = q(useUserPrices(params)) // when in soft liquidation, repay doesn't change liquidation prices
  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <RepayLoanInfoList
          market={market}
          form={form}
          params={params}
          values={values}
          tokens={{ collateralToken, borrowToken }}
          networks={networks}
          onSlippageChange={(slippage) => updateForm(form, { slippage })}
          hasLeverage={market && hasLeverage(market)}
          swapRequired={false}
          routes={routes}
          prices={userPrices}
          prevPrices={userPrices}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Debt to repay`}
        token={borrowToken}
        blockchainId={network.id}
        name="userBorrowed"
        form={form}
        max={{ ...q(maxRepay), fieldName: maxRepay.field }}
        testId="improve-health-input-debt"
        network={network}
        message={
          <Balance
            prefix={t`Max repay amount:`}
            tooltip={t`Max available to repay`}
            symbol={borrowToken?.symbol}
            balance={maxRepay.data}
            loading={maxRepay.isLoading}
            onClick={() => updateForm(form, { userBorrowed: maxRepay.data })}
          />
        }
      />

      <AlertRepayDebtToIncreaseHealth />

      <Stack gap={Spacing.xs}>
        <Button type="submit" loading={isPending} disabled={isDisabled} data-testid="improve-health-submit-button">
          {isPending
            ? t`Processing...`
            : joinButtonText(
                isApproved?.data === false && t`Approve`,
                t`Repay debt`,
                isFull ? 'Close Position' : 'Increase Health',
              )}
        </Button>

        <ButtonGetCrvUsd />
      </Stack>

      <FormAlerts
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
