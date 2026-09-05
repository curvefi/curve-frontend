import type { NetworkDict } from '@/llamalend/llamalend.types'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'
import { useWithdrawForm } from '../hooks/useWithdrawForm'
import { AlertUnstakeFirst } from './alerts/AlertUnstakeFirst'
import { WithdrawSupplyInfoList } from './WithdrawSupplyInfoList'

type WithdrawFormProps<ChainId extends IChainId> = {
  networks: NetworkDict<ChainId>
}

const TEST_ID_PREFIX = 'supply-withdraw'

export const WithdrawForm = <ChainId extends IChainId>({ networks }: WithdrawFormProps<ChainId>) => {
  const { chainId, marketId, controllerAddress } = useMarketContext<ChainId>()
  const network = networks[chainId]

  const {
    form,
    params,
    isPending,
    onSubmit,
    isDisabled,
    userAddress,
    borrowToken,
    withdrawError,
    formErrors,
    max,
    maxStakedShares,
    isFull,
  } = useWithdrawForm({ network })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <WithdrawSupplyInfoList
          form={form}
          params={params}
          tokens={{ borrowToken }}
          controllerAddress={controllerAddress}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to withdraw`}
        token={borrowToken}
        blockchainId={network.blockchainId}
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

      {max.data && maxStakedShares.data && Number(max.data) === 0 && Number(maxStakedShares.data) > 0 && (
        <AlertUnstakeFirst />
      )}

      <EvmFormButton
        pending={isPending}
        loading={!marketId}
        disabled={isDisabled}
        label={isFull.data ? t`Withdraw All` : t`Withdraw`}
        testId={`${TEST_ID_PREFIX}-submit-button`}
      />

      <FormAlerts
        error={withdrawError}
        formErrors={formErrors}
        handledErrors={['withdrawAmount']}
        userAddress={userAddress}
      />
    </Form>
  )
}
