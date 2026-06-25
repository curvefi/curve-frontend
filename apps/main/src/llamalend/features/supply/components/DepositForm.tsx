import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useDepositForm } from '../hooks/useDepositForm'
import { DepositSupplyInfoList } from './DepositSupplyInfoList'

type DepositFormProps<ChainId extends IChainId> = {
  marketId: string | undefined
  controllerAddress: Address | undefined
  tokens: MarketTokensOrEmpty
  marketType: LlamaMarketType
  networks: NetworkDict<ChainId>
  chainId: ChainId
}

const TEST_ID_PREFIX = 'supply-deposit'

export const DepositForm = <ChainId extends IChainId>({
  marketId,
  controllerAddress,
  tokens,
  marketType,
  networks,
  chainId,
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
    solvencyModal: { onConfirm, onClose, isOpen },
  } = useDepositForm({ marketId, controllerAddress, tokens, marketType, network })

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
