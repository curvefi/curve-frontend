import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import { LoanInfoAccordion } from '@/llamalend/widgets/manage-loan/LoanInfoAccordion'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
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
  fromBorrowed,
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
    txHash,
    expectedBorrowed,
    // todo: routeImage, priceImpact
  } = useRepayForm({
    market,
    network,
    networks,
    enabled,
    onRepaid,
  })

  const marketRates = useMarketRates(params, isOpen)

  return (
    <Form // todo: prevHealth, prevRates, debt, prevDebt
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
            expectedBorrowed: expectedBorrowed.data?.totalBorrowed,
          })}
          gas={gas}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        {fromCollateral && (
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
        {fromWallet && (
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
        {fromBorrowed && (
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
    </Form>
  )
}
