import { useLoanToValueFromUserState } from '@/llamalend/features/manage-loan/hooks/useLoanToValueFromUserState'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { AddCollateralOptions } from '@/llamalend/mutations/add-collateral.mutation'
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
import { InputDivider } from '../../../widgets/InputDivider'
import { useAddCollateralForm } from '../hooks/useAddCollateralForm'

export const AddCollateralForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onAdded,
}: {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onAdded: NonNullable<AddCollateralOptions['onAdded']>
}) => {
  const network = networks[chainId]
  const [isOpen, , , toggle] = useSwitch(false)

  const {
    form,
    isPending,
    onSubmit,
    action,
    params,
    values,
    bands,
    health,
    prices,
    gas,
    isApproved,
    formErrors,
    collateralToken,
    borrowToken,
    txHash,
  } = useAddCollateralForm({
    market,
    network,
    networks,
    enabled,
    onAdded,
  })

  const marketRates = useMarketRates(params, isOpen)

  return (
    <LoanFormWrapper
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <LoanInfoAccordion // todo: prevHealth, prevRates, debt, prevDebt
          isOpen={isOpen}
          toggle={toggle}
          health={health}
          bands={bands}
          prices={prices}
          rates={marketRates}
          loanToValue={useLoanToValueFromUserState({
            chainId: params.chainId!,
            marketId: params.marketId,
            userAddress: params.userAddress,
            collateralToken,
            borrowToken,
            enabled: isOpen,
            collateralDelta: values.userCollateral,
          })}
          gas={gas}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        <LoanFormTokenInput
          label={t`Collateral to Add`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          testId="add-collateral-input"
          network={network}
        />
      </Stack>

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={formErrors.length > 0}
        data-testid="add-collateral-submit-button"
      >
        {isPending ? t`Processing...` : isApproved.data ? t`Add collateral` : t`Approve & Add collateral`}
      </Button>

      <LoanFormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['userCollateral']}
        successTitle={t`Collateral added`}
      />
    </LoanFormWrapper>
  )
}
