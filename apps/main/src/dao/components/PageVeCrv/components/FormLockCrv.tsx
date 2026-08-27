import { FieldLockedAmt } from '@/dao/components/PageVeCrv/components/FieldLockedAmt'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useIncreaseLockForm } from '@/dao/components/PageVeCrv/hooks/useIncreaseLockForm'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'

export const FormLockCrv = ({ curve, vecrvInfo }: PageVecrv) => {
  const { form, values, gas, isApproved, isPending, isDisabled, error, onSubmit, updateAmount } = useIncreaseLockForm({
    curve,
    vecrvInfo,
  })
  const amountFieldError =
    form.formState.visibleErrors.find(([field]) => field === 'lockedAmt' || field === 'maxLockedAmt')?.[1] || ''

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<VeCrvActionInfo gas={q(gas)} isApproved={isApproved} isOpen={form.formState.isValid} />}
    >
      <FieldLockedAmt
        curve={curve}
        disabled={isPending}
        haveSigner={!!curve?.signerAddress}
        formType="adjust_crv"
        vecrvInfo={vecrvInfo}
        lockedAmt={values.lockedAmt}
        lockedAmtError={amountFieldError}
        handleInpLockedAmt={updateAmount}
      />
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={['lockedAmt', 'maxLockedAmt']}
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
