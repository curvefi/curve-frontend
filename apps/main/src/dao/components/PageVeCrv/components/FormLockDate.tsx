import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useExtendLockForm } from '@/dao/components/PageVeCrv/hooks/useExtendLockForm'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { FormButton } from '@evm-ui/features/forms'
import { dayjs } from '@evm-ui/lib/dayjs'
import { t } from '@evm-ui/lib/i18n'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { AlertBox } from '@legacy-ui/AlertBox'

export const FormLockDate = ({ curve, vecrvInfo }: PageVecrv) => {
  const {
    form,
    values,
    currUnlockUtcTime,
    minUtcDate,
    maxUtcDate,
    isMax,
    calculatedDateLabel,
    gas,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateUnlockDate,
    selectQuickDate,
  } = useExtendLockForm({ curve, vecrvInfo })
  const dateError = form.formState.visibleErrors.find(([field]) => field === 'utcDate' || field === 'days')?.[1] ?? ''

  return (
    <Form {...form} onSubmit={onSubmit} footer={<VeCrvActionInfo gas={q(gas)} isOpen={form.formState.isValid} />}>
      <FieldDatePicker
        curve={curve}
        formType="adjust_date"
        currUnlockUtcTime={currUnlockUtcTime}
        disabled={isPending}
        isMax={isMax}
        minUtcDate={minUtcDate}
        maxUtcDate={maxUtcDate}
        vecrvInfo={vecrvInfo}
        utcDate={values.utcDate}
        utcDateError={dateError}
        calcdUtcDate={calculatedDateLabel}
        handleInpEstUnlockedDays={(_, date) => updateUnlockDate(toCalendarDate(dayjs.utc(date.toString())))}
        handleBtnClickQuickAction={(_, value, unit) => selectQuickDate(value, unit)}
      />
      {isMax && <AlertBox alertType="info">{t`You have reached the maximum locked date.`}</AlertBox>}
      <FormAlerts error={error} formErrors={form.formState.visibleErrors} handledErrors={['utcDate', 'days']} />
      <FormButton
        pending={isPending}
        loading={gas.isLoading || isPending}
        disabled={isDisabled}
        label={t`Increase Lock`}
        testId="extend-lock-submit-button"
        connectWalletTestId="vecrv-extend-lock-form"
      />
    </Form>
  )
}
