import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useExtendLockForm } from '@/dao/components/PageVeCrv/hooks/useExtendLockForm'
import { useExtendLockGasEstimate } from '@/dao/components/PageVeCrv/queries/extend-lock-estimate-gas.query'
import type { ChainId } from '@/dao/types/dao.types'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { AlertBox } from '@legacy-ui/AlertBox'

export const FormLockDate = ({ chainId }: { chainId: ChainId }) => {
  const {
    form,
    params,
    values,
    currentUnlockUtcTime,
    minUtcDate,
    maxUtcDate,
    isMax,
    effectiveUnlockDateLabel,
    currentVeCrv,
    futureVeCrv,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateUnlockDate,
    selectQuickDate,
    validationErrors: errors,
  } = useExtendLockForm({ chainId })
  const isOpen = form.isTouched('utcDate')

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <VeCrvActionInfo
          currentVeCrv={q(currentVeCrv)}
          futureVeCrv={futureVeCrv}
          gas={q(useExtendLockGasEstimate(params, isOpen))}
          isOpen={isOpen}
        />
      }
    >
      <FieldDatePicker
        chainId={chainId}
        id="adjust-date-date-picker"
        currentUnlockUtcTime={currentUnlockUtcTime}
        disabled={isPending}
        isMax={isMax}
        minUtcDate={minUtcDate}
        maxUtcDate={maxUtcDate}
        utcDate={values.utcDate}
        utcDateError={errors.utcDate ?? errors.days}
        effectiveUnlockDateLabel={effectiveUnlockDateLabel}
        handleInputEstimatedUnlockedDays={updateUnlockDate}
        handleQuickActionClick={selectQuickDate}
      />
      {isMax && <AlertBox alertType="info">{t`You have reached the maximum locked date.`}</AlertBox>}
      <FormAlerts error={error} formErrors={form.formState.visibleErrors} handledErrors={['utcDate', 'days']} />
      <FormButton
        pending={isPending}
        loading={isPending}
        disabled={isDisabled}
        label={t`Increase Lock`}
        testId="extend-lock-submit-button"
        connectWalletTestId="vecrv-extend-lock-form"
      />
    </Form>
  )
}
