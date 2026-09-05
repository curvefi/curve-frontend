import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { FieldLockedAmount } from '@/dao/components/PageVeCrv/components/FieldLockedAmount'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useCreateLockForm } from '@/dao/components/PageVeCrv/hooks/useCreateLockForm'
import { useCreateLockGasEstimate } from '@/dao/components/PageVeCrv/queries/create-lock-estimate-gas.query'
import type { ChainId } from '@/dao/types/dao.types'
import { FormButton } from '@evm-ui/features/forms'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { fromEntries } from '@primitives/objects.utils'
import { q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const FormLockCreate = ({ chainId }: { chainId: ChainId }) => {
  const {
    form,
    params,
    values,
    currentUtcDate,
    minUtcDate,
    maxUtcDate,
    futureVeCrv,
    isApproved,
    isPending,
    isDisabled,
    userAddress,
    error,
    onSubmit,
    updateAmount,
    effectiveUnlockDateLabel,
    updateUnlockDate,
    selectQuickDate,
  } = useCreateLockForm({ chainId })

  const errors = form.formState.errors
  const visibleErrors = fromEntries(form.formState.visibleErrors)
  const isOpen = form.isTouched('lockedAmount', 'utcDate')

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <VeCrvActionInfo
          futureVeCrv={futureVeCrv}
          gas={q(useCreateLockGasEstimate(params, isOpen))}
          isApproved={isApproved}
          isOpen={isOpen}
        />
      }
    >
      <FieldLockedAmount
        chainId={chainId}
        disabled={isPending}
        noCurrentLock
        lockedAmount={values.lockedAmount}
        lockedAmountError={visibleErrors.lockedAmount ?? (values.maxLockedAmount && errors.maxLockedAmount?.message)}
        onBalance={updateAmount}
      />
      <FieldDatePicker
        chainId={chainId}
        id="create-date-picker"
        noCurrentLock
        currentUnlockUtcTime={currentUtcDate}
        disabled={isPending}
        minUtcDate={minUtcDate}
        maxUtcDate={maxUtcDate}
        utcDate={values.utcDate}
        utcDateError={visibleErrors.utcDate ?? visibleErrors.days}
        effectiveUnlockDateLabel={effectiveUnlockDateLabel}
        handleInputEstimatedUnlockedDays={updateUnlockDate}
        handleQuickActionClick={selectQuickDate}
      />
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={['lockedAmount', 'maxLockedAmount', 'utcDate', 'days']}
        userAddress={userAddress}
      />
      <FormButton
        pending={isPending}
        loading={isPending}
        disabled={isDisabled}
        label={[isApproved === false && t`Approve`, t`Create Lock`]}
        testId="create-lock-submit-button"
        connectWalletTestId="vecrv-create-lock-form"
      />
    </Form>
  )
}
