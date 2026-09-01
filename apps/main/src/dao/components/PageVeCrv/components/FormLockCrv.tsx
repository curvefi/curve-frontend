import { FieldLockedAmount } from '@/dao/components/PageVeCrv/components/FieldLockedAmount'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useIncreaseLockForm } from '@/dao/components/PageVeCrv/hooks/useIncreaseLockForm'
import { useIncreaseLockGasEstimate } from '@/dao/components/PageVeCrv/queries/increase-lock-estimate-gas.query'
import { networks } from '@/dao/networks'
import type { ChainId } from '@/dao/types/dao.types'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { fromEntries } from '@primitives/objects.utils'

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
    error,
    onSubmit,
    updateAmount,
  } = useIncreaseLockForm({ chainId })
  const errors = fromEntries(form.formState.visibleErrors)
  const amountFieldError = errors.lockedAmount ?? errors.maxLockedAmount
  const isOpen = form.isTouched('lockedAmount')
  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <VeCrvActionInfo
          currentVeCrv={q(currentVeCrv)}
          futureVeCrv={futureVeCrv}
          gas={q(useIncreaseLockGasEstimate(networks, params, isOpen))}
          isApproved={isApproved}
          isOpen={isOpen}
        />
      }
    >
      <FieldLockedAmount
        chainId={chainId}
        disabled={isPending}
        lockedAmount={values.lockedAmount}
        lockedAmountError={amountFieldError}
        onBalance={updateAmount}
      />
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={['lockedAmount', 'maxLockedAmount']}
      />
      <FormButton
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
