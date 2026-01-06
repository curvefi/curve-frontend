import { RepayLoanInfoAccordion } from '@/llamalend/features/borrow/components/RepayLoanInfoAccordion'
import { setValueOptions } from '@/llamalend/features/borrow/react-form.utils'
import { hasDeleverage, hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { InputDivider } from '../../../widgets/InputDivider'
import { useRepayForm } from '../hooks/useRepayForm'

export const RepayForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRepaid,
  fromCollateral,
  fromWallet,
  fromBorrowed: showUserBorrowed,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRepaid?: RepayOptions['onRepaid']
  fromCollateral?: boolean
  fromWallet?: boolean
  fromBorrowed?: boolean
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
    isRepaid,
    repayError,
    txHash,
    isApproved,
    formErrors,
    isFull,
  } = useRepayForm({
    market,
    network,
    networks,
    enabled,
    onRepaid,
  })
  const { withdrawEnabled: withdrawEnabled } = values
  const showStateCollateral = market && hasLeverage(market) && fromCollateral
  const showUserCollateral = market && (hasLeverage(market) || hasDeleverage(market)) && fromWallet
  return (
    <Form // todo: prevHealth, prevRates, debt, prevDebt
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <RepayLoanInfoAccordion
          params={params}
          values={values}
          collateralToken={collateralToken}
          borrowToken={borrowToken}
          networks={networks}
          onSlippageChange={(value) => form.setValue('slippage', value, setValueOptions)}
          hasLeverage={market && hasLeverage(market)}
        />
      }
    >
      <Stack divider={withdrawEnabled ? <InputDivider /> : undefined}>
        {showStateCollateral && (
          <LoanFormTokenInput
            label={t`From collateral (position)`}
            token={collateralToken}
            blockchainId={network.id}
            name="stateCollateral"
            form={form}
            testId="repay-state-collateral-input"
            network={network}
          />
        )}
        {showUserCollateral && (
          <LoanFormTokenInput
            label={t`From collateral (wallet)`}
            token={collateralToken}
            blockchainId={network.id}
            name="userCollateral"
            form={form}
            testId="repay-user-collateral-input"
            network={network}
          />
        )}
        {showUserBorrowed && (
          <LoanFormTokenInput
            label={t`From borrowed token`}
            token={borrowToken}
            blockchainId={network.id}
            name="userBorrowed"
            form={form}
            testId="repay-user-borrowed-input"
            network={network}
          />
        )}
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            checked={withdrawEnabled}
            onChange={(e) => form.setValue('withdrawEnabled', e.target.checked, setValueOptions)}
          />
        }
        label={t`Repay & Withdraw`}
      />
      <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
        {isPending
          ? t`Processing...`
          : notFalsy(isApproved?.data && t`Approve`, isFull.data ? t`Repay full` : t`Repay`).join(' & ')}
      </Button>

      <LoanFormAlerts
        isSuccess={isRepaid}
        error={repayError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={notFalsy(
          showStateCollateral && 'stateCollateral',
          showUserCollateral && 'userCollateral',
          showUserBorrowed && 'userBorrowed',
        )}
        successTitle={t`Loan repaid`}
      />
    </Form>
  )
}
