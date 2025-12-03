import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import { LoanFormWrapper } from '@/llamalend/widgets/manage-loan/LoanFormWrapper'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'
import { InputDivider } from '../../../widgets/InputDivider'
import { useRepayForm } from '../hooks/useRepayForm'

export const RepayForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onRepaid,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onRepaid: NonNullable<RepayOptions['onRepaid']>
}) => {
  const network = networks[chainId]
  const [isOpen, , , toggle] = useSwitch(false)

  const {
    form,
    isPending,
    onSubmit,
    action,
    bands,
    health,
    prices,
    gas,
    isDisabled,
    isFull,
    formErrors,
    collateralToken,
    borrowToken,
    params,
    values,
    txHash,
    expectedBorrowed,
    routeImage,
    priceImpact,
  } = useRepayForm({
    market,
    network,
    networks,
    enabled,
    onRepaid,
  })

  const marketRates = useMarketRates(params, isOpen)

  return (
    <LoanFormWrapper // todo: prevHealth, prevRates, debt, prevDebt
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <LoanInfoAccordion
          isOpen={isOpen}
          toggle={toggle}
          health={health}
          bands={bands}
          prices={prices}
          rates={marketRates}
          loanToValue={useLoanToValueFromUserState({
            chainId,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            enabled: isOpen,
            debtDelta: values.userBorrowed == null ? undefined : (`-${values.userBorrowed}` as Decimal),
          })}
          gas={gas}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        <LoanFormTokenInput
          label={t`From collateral (position)`}
          token={collateralToken}
          blockchainId={network.id}
          name="stateCollateral"
          form={form}
          testId="repay-state-collateral-input"
          network={network}
        />
        <LoanFormTokenInput
          label={t`From collateral (wallet)`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          testId="repay-user-collateral-input"
          network={network}
        />
        <LoanFormTokenInput
          label={t`From borrowed token`}
          token={borrowToken}
          blockchainId={network.id}
          name="userBorrowed"
          form={form}
          testId="repay-user-borrowed-input"
          network={network}
        />
      </Stack>

      <Button type="submit" loading={isPending || !market} disabled={isDisabled} data-testid="repay-submit-button">
        {isPending ? t`Processing...` : isFull.data ? t`Repay full` : t`Repay`}
      </Button>

      <LoanFormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['stateCollateral', 'userCollateral', 'userBorrowed']}
        successTitle={t`Loan repaid`}
      />
    </LoanFormWrapper>
  )
}
