import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useMarketContext } from '../../market-context'
import { useUnstakeForm } from '../hooks/useUnstakeForm'
import { AlertUnstakeOnly } from './alerts/AlertUnstakeOnly'
import { UnstakeSupplyInfoList } from './UnstakeSupplyInfoList'

type UnstakeFormProps<ChainId extends IChainId> = {
  networks: NetworkDict<ChainId>
}

const TEST_ID_PREFIX = 'supply-unstake'

export const UnstakeForm = <ChainId extends IChainId>({ networks }: UnstakeFormProps<ChainId>) => {
  const { chainId, marketId, controllerAddress } = useMarketContext<ChainId>()
  const network = networks[chainId]
  const blockchainId = network.id

  const {
    form,
    form: { update: updateForm },
    params,
    isPending,
    onSubmit,
    isDisabled,
    borrowToken,
    unstakeError,
    formErrors,
    max,
  } = useUnstakeForm({
    network,
  })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <UnstakeSupplyInfoList
          form={form}
          params={params}
          networks={networks}
          borrowToken={borrowToken}
          controllerAddress={controllerAddress}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to unstake`}
        token={borrowToken}
        blockchainId={blockchainId}
        name="unstakeAssets"
        form={form}
        max={max}
        testId={`${TEST_ID_PREFIX}-input`}
        network={network}
        positionBalance={{ position: max, tooltip: t`Staked amount` }}
        onValueChange={value => updateForm({ isFull: value === max.data })}
      />
      {Number(max.data) > 0 && <AlertUnstakeOnly />}

      <FormButton
        pending={isPending}
        loading={!marketId}
        disabled={isDisabled}
        label={t`Unstake`}
        testId={`${TEST_ID_PREFIX}-submit-button`}
      />

      <FormAlerts error={unstakeError} formErrors={formErrors} handledErrors={['unstakeAssets', 'unstakeShares']} />
    </Form>
  )
}
