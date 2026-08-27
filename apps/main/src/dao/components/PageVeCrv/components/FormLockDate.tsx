import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { useExtendLockForm } from '@/dao/components/PageVeCrv/hooks/useExtendLockForm'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { networks } from '@/dao/networks'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { FormButton } from '@evm-ui/features/forms'
import { dayjs } from '@evm-ui/lib/dayjs'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { AlertBox } from '@legacy-ui/AlertBox'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'

export const FormLockDate = ({ curve, rChainId, vecrvInfo }: PageVecrv) => {
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
    success,
    onSubmit,
    updateUnlockDate,
    selectQuickDate,
  } = useExtendLockForm({ curve, vecrvInfo })
  const dateError = form.formState.visibleErrors.find(([field]) => field === 'utcDate' || field === 'days')?.[1] ?? ''

  return (
    <Form {...form} onSubmit={onSubmit} footer={null}>
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
      <ActionInfoGasEstimate gas={q(gas)} />
      {isMax && <AlertBox alertType="info">{t`You have reached the maximum locked date.`}</AlertBox>}
      {success && (
        <TxInfoBar description={t`Lock date updated`} txHash={scanTxPath(networks[rChainId], success.hash)} />
      )}
      <FormButton
        pending={isPending}
        loading={gas.isLoading || isPending}
        disabled={isDisabled}
        label={t`Increase Lock`}
        testId="extend-lock-submit-button"
        connectWalletTestId="vecrv-extend-lock-form"
      />
      <FormAlerts error={error} formErrors={form.formState.visibleErrors} handledErrors={['utcDate', 'days']} />
    </Form>
  )
}
