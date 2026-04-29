import type { FormDisabledAlert, LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
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
  depositDisabledAlert?: FormDisabledAlert
}

const TEST_ID_PREFIX = 'supply-deposit'

export const DepositForm = <ChainId extends IChainId>({
  market,
  networks,
  chainId,
  enabled,
  depositDisabledAlert,
}: DepositFormProps<ChainId>) => {
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    isLoading,
    onSubmit,
    isDisabled,
    borrowToken,
    error,
    formErrors,
    isApproved,
    max,
    disabledAlert,
    lowSolvencyModalProps,
  } = useDepositForm({ market, network, enabled, depositDisabledAlert })

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

      {disabledAlert ? (
        <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>
      ) : (
        <Button type="submit" loading={isLoading} disabled={isDisabled} data-testid={`${TEST_ID_PREFIX}-submit-button`}>
          {isPending ? t`Processing...` : notFalsy(isApproved.data === false && t`Approve`, t`Deposit`).join(' & ')}
        </Button>
      )}
      <LowSolvencyActionModal {...lowSolvencyModalProps} />
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['depositAmount']} />
    </Form>
  )
}
