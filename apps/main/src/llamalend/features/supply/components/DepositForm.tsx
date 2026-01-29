import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { DepositOptions } from '@/llamalend/mutations/deposit.mutation'
import { LoanFormAlerts } from '@/llamalend/widgets/manage-loan/LoanFormAlerts'
import { LoanFormTokenInput } from '@/llamalend/widgets/manage-loan/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { useDepositForm } from '../hooks/useDepositForm'

export type DepositFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onDeposited?: NonNullable<DepositOptions['onDeposited']>
}

const TEST_ID_PREFIX = 'supply-deposit'

export const DepositForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onDeposited,
}: DepositFormProps<ChainId>) => {
  const network = networks[chainId]

  const {
    form,
    isPending,
    onSubmit,
    isDisabled,
    borrowToken,
    isDeposited,
    depositError,
    txHash,
    formErrors,
    isApproved,
    max,
  } = useDepositForm({
    market,
    network,
    enabled,
    onDeposited,
  })

  return (
    <Form {...form} onSubmit={onSubmit} infoAccordion={null}>
      <LoanFormTokenInput
        label={t`Amount to deposit`}
        token={borrowToken}
        blockchainId={network.id}
        name="depositAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid={`${TEST_ID_PREFIX}-submit-button`}
      >
        {isPending ? t`Processing...` : notFalsy(isApproved.data === false && t`Approve`, t`Deposit`).join(' & ')}
      </Button>

      <LoanFormAlerts
        isSuccess={isDeposited}
        error={depositError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['depositAmount']}
        successTitle={t`Deposited successfully`}
      />
    </Form>
  )
}
