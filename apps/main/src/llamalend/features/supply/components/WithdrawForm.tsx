import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { WithdrawOptions } from '@/llamalend/mutations/withdraw.mutation'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useWithdrawForm } from '../hooks/useWithdrawForm'
import { WithdrawSupplyInfoAccordion } from './WithdrawSupplyInfoAccordion'

export type WithdrawFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
  onWithdrawn?: NonNullable<WithdrawOptions['onWithdrawn']>
}

const TEST_ID_PREFIX = 'supply-withdraw'

export const WithdrawForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  onWithdrawn,
}: WithdrawFormProps<ChainId>) => {
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    onSubmit,
    isDisabled,
    borrowToken,
    isWithdrawn,
    withdrawError,
    txHash,
    formErrors,
    max,
  } = useWithdrawForm({
    market,
    network,
    enabled,
    onWithdrawn,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      infoAccordion={<WithdrawSupplyInfoAccordion params={params} networks={networks} tokens={{ borrowToken }} />}
    >
      <LoanFormTokenInput
        label={t`Amount to withdraw`}
        token={borrowToken}
        blockchainId={network.id}
        name="withdrawAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        positionBalance={{
          position: max,
          tooltip: t`Vault shares value`,
        }}
      />

      <Button
        type="submit"
        loading={isPending || !market}
        disabled={isDisabled}
        data-testid={`${TEST_ID_PREFIX}-submit-button`}
      >
        {isPending ? t`Processing...` : t`Withdraw`}
      </Button>

      <FormAlerts
        isSuccess={isWithdrawn}
        error={withdrawError}
        txHash={txHash}
        formErrors={formErrors}
        network={network}
        handledErrors={['withdrawAmount']}
        successTitle={t`Withdrawn successfully`}
      />
    </Form>
  )
}
