import { styled } from 'styled-components'
import { Countdown } from '@/dao/components/Countdown'
import { useWithdrawLockForm } from '@/dao/components/PageVeCrv/hooks/useWithdrawLockForm'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { networks } from '@/dao/networks'
import { FormButton } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { q } from '@evm-ui/types/util'
import { amount, formatNumber } from '@evm-ui/utils'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { AlertBox } from '@legacy-ui/AlertBox'
import { Box } from '@legacy-ui/Box'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'

export const FormWithdraw = ({ curve, rChainId, vecrvInfo }: PageVecrv) => {
  const { form, canUnlock, gas, isPending, isDisabled, error, success, onSubmit } = useWithdrawLockForm({
    curve,
    vecrvInfo,
  })

  return (
    <Form {...form} onSubmit={onSubmit} footer={null}>
      <WithdrawInfo display="flex" flexDirection="column" flexGap="var(--spacing-1)">
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <p>{t`CRV Locked`}:</p>
          <RowParagraph>
            {formatNumber(amount(vecrvInfo.lockedAmountAndUnlockTime.lockedAmount), {
              abbreviate: false,
              fallback: '-',
            })}
          </RowParagraph>
        </Box>
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <p>{t`Unlock Time`}:</p>
          <RowParagraph>{new Date(vecrvInfo.lockedAmountAndUnlockTime.unlockTime).toLocaleString()}</RowParagraph>
        </Box>
      </WithdrawInfo>

      {!canUnlock && (
        <AlertBox alertType="info">
          {t`Your CRV unlocks in:`}
          <StyledCountdown endDate={vecrvInfo.lockedAmountAndUnlockTime.unlockTime / 1000} />
        </AlertBox>
      )}
      {canUnlock && <ActionInfoGasEstimate gas={q(gas)} />}
      {success && (
        <TxInfoBar description={t`Locked CRV withdrawn`} txHash={scanTxPath(networks[rChainId], success.hash)} />
      )}
      <FormButton
        pending={isPending}
        loading={isPending}
        disabled={isDisabled}
        label={t`Withdraw`}
        testId="withdraw-lock-submit-button"
        connectWalletTestId="vecrv-withdraw-lock-form"
      />
      <FormAlerts error={error} formErrors={form.formState.visibleErrors} handledErrors={[]} />
    </Form>
  )
}

const WithdrawInfo = styled(Box)`
  p {
    font-size: var(--font-size-2);
  }
`

const RowParagraph = styled.p`
  font-weight: var(--bold);
`

const StyledCountdown = styled(Countdown)`
  margin-left: var(--spacing-2);
`
