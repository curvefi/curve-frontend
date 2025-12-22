import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { AddCollateralOptions } from '@/llamalend/mutations/add-collateral.mutation'
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
  onAdded?: NonNullable<AddCollateralOptions['onAdded']>
}) => {
  const network = networks[chainId]
  const [isOpen, , , toggle] = useSwitch(false)

  const {
    form,
    isPending,
    onSubmit,
    action,
    values,
    health,
    gas,
    isApproved,
    formErrors,
    collateralToken,
    borrowToken,
    txHash,
    userState,
    expectedCollateral,
    prevHealth,
    marketRates,
    prevLoanToValue,
    loanToValue,
  } = useAddCollateralForm({
    market,
    network,
    networks,
    enabled,
    onAdded,
    isAccordionOpen: isOpen,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={
        <LoanInfoAccordion // todo: prevRates
          isOpen={isOpen}
          toggle={toggle}
          prevHealth={prevHealth}
          health={health}
          rates={marketRates}
          prevLoanToValue={prevLoanToValue}
          loanToValue={loanToValue}
          userState={{
            ...userState,
            borrowTokenSymbol: borrowToken?.symbol,
            collateralTokenSymbol: collateralToken?.symbol,
          }}
          gas={gas}
          collateral={expectedCollateral}
        />
      }
    >
      <Stack divider={<InputDivider />}>
        <LoanFormTokenInput
          label={t`Amount to Add`}
          token={collateralToken}
          blockchainId={network.id}
          name="userCollateral"
          form={form}
          testId="add-collateral-input"
          network={network}
        />
      </Stack>

      <LoanFormAlerts
        isSuccess={action.isSuccess}
        error={action.error}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['userCollateral']}
        successTitle={t`Collateral added`}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={formErrors.length > 0}
        data-testid="add-collateral-submit-button"
      >
        {isPending
          ? t`Processing...`
          : isApproved.data || isApproved.isPending || !values.userCollateral
            ? t`Add collateral`
            : t`Approve & Add collateral`}
      </Button>
    </Form>
  )
}
