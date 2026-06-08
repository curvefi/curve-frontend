import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { networks, networksIdMapper } from '@/loan/networks'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Button from '@mui/material/Button'
import { joinButtonText } from '@primitives/string.utils'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useScrvUsdDepositForm } from './hooks/useScrvUsdDepositForm'

export const ScrvUsdDepositForm = ({ network }: NetworkUrlParams) => {
  const chainId = networksIdMapper[network]
  const { form, isApproved, isPending, isDisabled, error, formErrors, max, onSubmit } = useScrvUsdDepositForm({
    chainId,
  })
  const networkConfig = networks[chainId]
  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Form submit handlers are async through react-hook-form.
      onSubmit={onSubmit}
      footer={null}
    >
      <LoanFormTokenInput
        label={t`Amount to deposit`}
        token={{ address: CRVUSD_ADDRESS, symbol: 'crvUSD' }}
        blockchainId={networkConfig.id}
        name="depositAmount"
        form={form}
        max={{ ...q(max), fieldName: max.fieldName }}
        testId="scrvusd-deposit-input"
        network={networkConfig}
      />
      <Button type="submit" loading={isPending} disabled={isDisabled} data-testid="scrvusd-deposit-submit-button">
        {isPending ? t`Processing...` : joinButtonText(isApproved.data === false && t`Approve`, t`Deposit`)}
      </Button>
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['depositAmount']} />
    </Form>
  )
}
