import { FieldLockedAmount } from '@/dao/components/PageVeCrv/components/FieldLockedAmount'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useIncreaseLockForm } from '@/dao/components/PageVeCrv/hooks/useIncreaseLockForm'
import { useIncreaseLockGasEstimate } from '@/dao/components/PageVeCrv/queries/increase-lock-estimate-gas.query'
import type { ChainId } from '@/dao/types/dao.types'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { fromEntries } from '@primitives/objects.utils'
import { q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const FormLockCrv = ({ chainId }: { chainId: ChainId }) => {
  const {
    form,
    params,
    values,
    currentVeCrv,
    futureVeCrv,
    isApproved,
    isPending,
    isDisabled,
    userAddress,
    error,
    onSubmit,
    updateAmount,
  } = useIncreaseLockForm({ chainId })
  const errors = form.formState.errors
  const visibleErrors = fromEntries(form.formState.visibleErrors)

  const isOpen = form.isTouched('lockedAmount')
  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <VeCrvActionInfo
          currentVeCrv={q(currentVeCrv)}
          futureVeCrv={futureVeCrv}
          gas={q(useIncreaseLockGasEstimate(params, isOpen))}
          isApproved={isApproved}
          isOpen={isOpen}
        />
      }
    >
      <FieldLockedAmount
        chainId={chainId}
        disabled={isPending}
        lockedAmount={values.lockedAmount}
        lockedAmountError={visibleErrors.lockedAmount ?? (values.maxLockedAmount && errors.maxLockedAmount?.message)}
        onBalance={updateAmount}
      />
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={['lockedAmount', 'maxLockedAmount']}
        userAddress={userAddress}
      />
      <EvmFormButton
        pending={isPending}
        loading={isPending}
        disabled={isDisabled}
        label={[isApproved === false && t`Approve`, t`Increase Lock Amount`]}
        testId="increase-lock-submit-button"
        connectWalletTestId="vecrv-increase-lock-form"
      />
    </Form>
  )
}
