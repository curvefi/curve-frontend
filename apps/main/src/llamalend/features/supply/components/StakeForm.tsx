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
import { useStakeForm } from '../hooks/useStakeForm'
import { AlertNoGauge } from './alerts/AlertNoGauge'
import { StakeSupplyInfoList } from './StakeSupplyInfoList'

type StakeFormProps<ChainId extends IChainId> = {
  networks: NetworkDict<ChainId>
}

const TEST_ID_PREFIX = 'supply-stake'

export const StakeForm = <ChainId extends IChainId>({ networks }: StakeFormProps<ChainId>) => {
  const { chainId, controllerAddress } = useMarketContext<ChainId>()
  const network = networks[chainId]
  const blockchainId = network.id

  const {
    form,
    form: { update: updateForm },
    params,
    isPending,
    isLoading,
    onSubmit,
    isDisabled,
    borrowToken,
    error,
    formErrors,
    isApproved,
    hasGauge,
    max,
    disabledAlert,
    solvencyModal: { onConfirm, onClose, isOpen },
  } = useStakeForm({ network })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <StakeSupplyInfoList
          form={form}
          params={params}
          networks={networks}
          tokens={{ borrowToken }}
          controllerAddress={controllerAddress}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to stake`}
        token={borrowToken}
        blockchainId={blockchainId}
        name="stakeAssets"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        positionBalance={{ position: max, tooltip: t`Vault share value` }}
        onValueChange={value => updateForm({ isFull: value === max.data })}
      />

      <FormButton
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={[isApproved.data === false && t`Approve`, t`Stake`]}
        testId={`${TEST_ID_PREFIX}-submit-button`}
      >
        {hasGauge ? disabledAlert && <AlertDisableForm>{disabledAlert.message}</AlertDisableForm> : <AlertNoGauge />}
      </FormButton>

      <LowSolvencyActionModal
        action="stake"
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        tokenSymbol={borrowToken?.symbol}
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['stakeAssets', 'stakeShares']} />
    </Form>
  )
}
