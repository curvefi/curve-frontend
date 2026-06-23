import { useConnection } from 'wagmi'
import { getControllerAddress } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { LowSolvencyActionModal } from '@/llamalend/widgets/action-card/LowSolvencyActionModal'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Button from '@mui/material/Button'
import { notFalsy } from '@primitives/objects.utils'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
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
  const { isConnected } = useConnection()
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
  } = useDepositForm({ market, network, enabled })

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
          controllerAddress={getControllerAddress(market)}
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

      {isConnected ? (
        disabledAlert ? (
          <AlertDisableForm>{disabledAlert.message}</AlertDisableForm>
        ) : (
          <Button
            type="submit"
            loading={isLoading}
            disabled={isDisabled}
            data-testid={`${TEST_ID_PREFIX}-submit-button`}
          >
            {isPending ? t`Processing...` : notFalsy(isApproved.data === false && t`Approve`, t`Deposit`).join(' & ')}
          </Button>
        )
      ) : (
        <ConnectWalletButton />
      )}
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
