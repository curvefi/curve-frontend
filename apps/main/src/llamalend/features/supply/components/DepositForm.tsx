import type { NetworkDict } from '@/llamalend/llamalend.types'
import { getFormButtonLabel } from '@/llamalend/widgets/action-card/form-button-label'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { AlertDisableForm } from '@ui/features/forms/AlertDisableForm'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositSupplyInfoList } from './DepositSupplyInfoList'

type DepositFormProps<ChainId extends IChainId> = { networks: NetworkDict<ChainId> }

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
    userAddress,
    borrowToken,
    error,
    formErrors,
    isApproved,
    max,
    disabledAlert,
    solvencyModal,
  } = useDepositForm({ network })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <DepositSupplyInfoList
          form={form}
          params={params}
          tokens={{ borrowToken }}
          controllerAddress={controllerAddress}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to deposit`}
        token={borrowToken}
        blockchainId={network.blockchainId}
        name="depositAmount"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
      />

      <EvmFormButton
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={getFormButtonLabel({ isApproved, labels: [t`Deposit`] })}
        testId={`${TEST_ID_PREFIX}-submit-button`}
        connectWalletTestId="form-market-page"
      >
        {disabledAlert && <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>}
      </EvmFormButton>
      <LowSolvencyActionModal {...solvencyModal} action="deposit" tokenSymbol={borrowToken?.symbol} />
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['depositAmount']} userAddress={userAddress} />
    </Form>
  )
}
