import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useMarketContext } from '../../market-context'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositSupplyInfoList } from './DepositSupplyInfoList'

type DepositFormProps<ChainId extends IChainId> = {
  networks: NetworkDict<ChainId>
}

const TEST_ID_PREFIX = 'supply-deposit'

export const DepositForm = <ChainId extends IChainId>({ networks }: DepositFormProps<ChainId>) => {
  const { chainId, controllerAddress } = useMarketContext<ChainId>()
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
    solvencyModal: { onConfirm, onClose, isOpen },
  } = useDepositForm({ network })

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      onSubmit={onSubmit}
      footer={
        <DepositSupplyInfoList
          form={form}
          params={params}
          networks={networks}
          tokens={{ borrowToken }}
          controllerAddress={controllerAddress}
        />
      }
    >
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

      <FormButton
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={[isApproved.data === false && t`Approve`, t`Deposit`]}
        testId={`${TEST_ID_PREFIX}-submit-button`}
        connectWalletTestId="form-connect-wallet"
      >
        {disabledAlert && <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>}
      </FormButton>
      <LowSolvencyActionModal
        action="deposit"
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        tokenSymbol={borrowToken?.symbol}
      />
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['depositAmount']} />
    </Form>
  )
}
