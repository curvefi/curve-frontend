import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useExtendLockForm } from '@/dao/components/PageVeCrv/hooks/useExtendLockForm'
import type { ChainId } from '@/dao/types/dao.types'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { AlertBox } from '@legacy-ui/AlertBox'
import { fromEntries } from '@primitives/objects.utils'

export const FormLockDate = ({ chainId }: { chainId: ChainId }) => {
  const {
    form,
    values,
    currUnlockUtcTime,
    minUtcDate,
    maxUtcDate,
    isMax,
    dateLabel,
    gas,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateUnlockDate,
    selectQuickDate,
  } = useExtendLockForm({ chainId })
  const errors = fromEntries(form.formState.visibleErrors)
  const dateError = errors.utcDate ?? errors.days ?? ''

  return (
    <Form {...form} onSubmit={onSubmit} footer={<VeCrvActionInfo gas={q(gas)} isOpen={form.formState.isValid} />}>
      <FieldDatePicker
        chainId={chainId}
        id="adjust-date-date-picker"
        currUnlockUtcTime={currUnlockUtcTime}
        disabled={isPending}
        isMax={isMax}
        minUtcDate={minUtcDate}
        maxUtcDate={maxUtcDate}
        utcDate={values.utcDate}
        utcDateError={dateError}
        dateLabel={dateLabel}
        handleInpEstUnlockedDays={updateUnlockDate}
        handleBtnClickQuickAction={selectQuickDate}
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
