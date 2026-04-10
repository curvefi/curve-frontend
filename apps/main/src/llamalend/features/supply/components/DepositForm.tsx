import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositSupplyInfoList } from './DepositSupplyInfoList'

type DepositFormProps<ChainId extends IChainId> = {
  market: LlamaMarketTemplate | undefined
  networks: NetworkDict<ChainId>
  chainId: ChainId
  enabled?: boolean
}

const TEST_ID_PREFIX = 'supply-deposit'

export const DepositForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
}: DepositFormProps<ChainId>) => {
  const network = networks[chainId]

  const { form, params, isPending, onSubmit, isDisabled, borrowToken, depositError, formErrors, isApproved, max } =
    useDepositForm({ market, network, enabled })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<DepositSupplyInfoList form={form} params={params} networks={networks} tokens={{ borrowToken }} />}
    >
      <LoanFormTokenInput
        label={t`Amount to deposit`}
        token={borrowToken}
        blockchainId={network.id}
        name="depositAmount"
        form={form}
        max={q(max)}
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

      <FormAlerts error={depositError} formErrors={formErrors} handledErrors={['depositAmount']} />
    </Form>
  )
}
