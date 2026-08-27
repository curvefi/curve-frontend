import { FieldDatePicker } from '@/dao/components/PageVeCrv/components/FieldDatePicker'
import { FieldLockedAmt } from '@/dao/components/PageVeCrv/components/FieldLockedAmt'
import { useCreateLockForm } from '@/dao/components/PageVeCrv/hooks/useCreateLockForm'
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
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'

export const FormLockCreate = ({ curve, rChainId, vecrvInfo }: PageVecrv) => {
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
    success,
    onSubmit,
    updateAmount,
    calculatedDateLabel,
    updateUnlockDate,
    selectQuickDate,
  } = useCreateLockForm({ curve, vecrvInfo })

  const haveSigner = !!curve?.signerAddress
  const dateError = form.formState.visibleErrors.find(([field]) => field === 'utcDate' || field === 'days')?.[1] ?? ''
  const amountFieldError =
    form.formState.visibleErrors.find(([field]) => field === 'lockedAmt' || field === 'maxLockedAmt')?.[1] || ''

  return (
    <Form {...form} onSubmit={onSubmit} footer={null}>
      <FieldLockedAmt
        curve={curve}
        disabled={isPending}
        haveSigner={haveSigner}
        formType="create"
        vecrvInfo={vecrvInfo}
        lockedAmt={values.lockedAmt}
        lockedAmtError={amountFieldError}
        handleInpLockedAmt={updateAmount}
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
        calcdUtcDate={calculatedDateLabel}
        lockedAmt={values.lockedAmt}
        handleInpEstUnlockedDays={(_, date) => updateUnlockDate(toCalendarDate(dayjs.utc(date.toString())))}
        handleBtnClickQuickAction={(_, value, unit) => selectQuickDate(value, unit)}
      />
      <ActionInfoGasEstimate gas={q(gas)} isApproved={isApproved} />
      {success && (
        <TxInfoBar
          description={t`Successfully locked ${success.lockedAmt} CRV until ${success.lockedDate}`}
          txHash={scanTxPath(networks[rChainId], success.hash)}
        />
      )}
      <FormButton
        pending={isPending}
        loading={gas.isLoading || isPending}
        disabled={isDisabled}
        label={[isApproved === false && t`Approve`, t`Create Lock`]}
        testId="create-lock-submit-button"
        connectWalletTestId="vecrv-create-lock-form"
      />
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={['lockedAmt', 'maxLockedAmt', 'utcDate', 'days']}
      />
    </Form>
  )
}
