import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { FieldLockedAmount } from '@/dao/components/PageVeCrv/components/FieldLockedAmount'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useCreateLockForm } from '@/dao/components/PageVeCrv/hooks/useCreateLockForm'
import type { ChainId } from '@/dao/types/dao.types'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { fromEntries } from '@primitives/objects.utils'

export const FormLockCreate = ({ chainId }: { chainId: ChainId }) => {
  const {
    form,
    values,
    currentUtcDate,
    minUtcDate,
    maxUtcDate,
    gas,
    isApproved,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateAmount,
    effectiveUnlockDateLabel,
    updateUnlockDate,
    selectQuickDate,
  } = useCreateLockForm({ chainId })

  const errors = fromEntries(form.formState.visibleErrors)

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<VeCrvActionInfo gas={q(gas)} isApproved={isApproved} isOpen={form.formState.isValid} />}
    >
      <FieldLockedAmount
        chainId={chainId}
        disabled={isPending}
        noCurrentLock
        lockedAmount={values.lockedAmount}
        lockedAmountError={errors.lockedAmount ?? errors.maxLockedAmount}
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
        utcDateError={errors.utcDate ?? errors.days}
        effectiveUnlockDateLabel={effectiveUnlockDateLabel}
        lockedAmount={values.lockedAmount}
        handleInputEstimatedUnlockedDays={updateUnlockDate}
        handleQuickActionClick={selectQuickDate}
      />
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={['lockedAmount', 'maxLockedAmount', 'utcDate', 'days']}
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
