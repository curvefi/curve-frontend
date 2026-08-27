import { FieldLockedAmt } from '@/dao/components/PageVeCrv/components/FieldLockedAmt'
import { useIncreaseLockForm } from '@/dao/components/PageVeCrv/hooks/useIncreaseLockForm'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { networks } from '@/dao/networks'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'

export const FormLockCrv = ({ curve, rChainId, vecrvInfo }: PageVecrv) => {
  const { form, values, gas, isApproved, isPending, isDisabled, error, success, onSubmit, updateAmount } =
    useIncreaseLockForm({ curve, vecrvInfo })
  const amountFieldError =
    form.formState.visibleErrors.find(([field]) => field === 'lockedAmt' || field === 'maxLockedAmt')?.[1] || ''

  return (
    <Form {...form} onSubmit={onSubmit} footer={null}>
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
      <ActionInfoGasEstimate gas={q(gas)} isApproved={isApproved} />
      {success && (
        <TxInfoBar description={t`Lock amount updated`} txHash={scanTxPath(networks[rChainId], success.hash)} />
      )}
      <FormButton
        pending={isPending}
        loading={isPending}
        disabled={isDisabled}
        label={[isApproved === false && t`Approve`, t`Increase Lock Amount`]}
        testId="increase-lock-submit-button"
        connectWalletTestId="vecrv-increase-lock-form"
      />
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={['lockedAmt', 'maxLockedAmt']}
      />
    </Form>
  )
}
