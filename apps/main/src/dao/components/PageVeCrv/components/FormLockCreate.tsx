import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { FieldLockedAmount } from '@/dao/components/PageVeCrv/components/FieldLockedAmount'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useCreateLockForm } from '@/dao/components/PageVeCrv/hooks/useCreateLockForm'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { fromEntries } from '@primitives/objects.utils'

export const FormLockCreate = ({ curve, vecrvInfo }: PageVecrv) => {
  const {
    form,
    values,
    currUtcDate,
    minUtcDate,
    maxUtcDate,
    gas,
    isApproved,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateAmount,
    dateLabel,
    updateUnlockDate,
    selectQuickDate,
  } = useCreateLockForm({ curve, vecrvInfo })

  const haveSigner = !!curve?.signerAddress
  const errors = fromEntries(form.formState.visibleErrors)
  const dateError = errors.utcDate ?? errors.days ?? ''
  const amountFieldError = errors.lockedAmount ?? errors.maxLockedAmount ?? ''

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<VeCrvActionInfo gas={q(gas)} isApproved={isApproved} isOpen={form.formState.isValid} />}
    >
      <FieldLockedAmount
        curve={curve}
        disabled={isPending}
        haveSigner={haveSigner}
        formType="create"
        vecrvInfo={vecrvInfo}
        lockedAmount={values.lockedAmount}
        lockedAmountError={amountFieldError}
        handleInpLockedAmount={updateAmount}
      />
      <FieldDatePicker
        curve={curve}
        formType="create"
        currUnlockUtcTime={currUtcDate}
        disabled={isPending}
        minUtcDate={minUtcDate}
        maxUtcDate={maxUtcDate}
        vecrvInfo={vecrvInfo}
        utcDate={values.utcDate}
        utcDateError={dateError}
        dateLabel={dateLabel}
        lockedAmount={values.lockedAmount}
        handleInpEstUnlockedDays={(_, date) => updateUnlockDate(date)}
        handleBtnClickQuickAction={(_, value, unit) => selectQuickDate(value, unit)}
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
