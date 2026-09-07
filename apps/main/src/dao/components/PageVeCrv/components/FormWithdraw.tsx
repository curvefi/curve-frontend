import { styled } from 'styled-components'
import { Countdown } from '@/dao/components/Countdown'
import { VeCrvActionInfo } from '@/dao/components/PageVeCrv/components/VeCrvActionInfo'
import { useWithdrawLockForm } from '@/dao/components/PageVeCrv/hooks/useWithdrawLockForm'
import { useWithdrawLockGasEstimate } from '@/dao/components/PageVeCrv/queries/withdraw-lock-estimate-gas.query'
import type { ChainId } from '@/dao/types/dao.types'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { amount, formatNumber } from '@evm-ui/utils'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { AlertBox } from '@legacy-ui/AlertBox'
import { Box } from '@legacy-ui/Box'
import { q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { MILLISECONDS_PER_SECOND } from '@ui/utils/time'

export const FormWithdraw = ({ chainId }: { chainId: ChainId }) => {
  const { form, params, canUnlock, lockedAmountAndUnlockTime, isPending, isDisabled, userAddress, error, onSubmit } =
    useWithdrawLockForm({ chainId })
  const lock = lockedAmountAndUnlockTime.data
  const isOpen = !!canUnlock
  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<VeCrvActionInfo gas={q(useWithdrawLockGasEstimate(params, isOpen))} isOpen={isOpen} />}
    >
      <WithdrawInfo display="flex" flexDirection="column" flexGap="var(--spacing-1)">
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <p>{t`CRV Locked`}:</p>
          <RowParagraph>
            {formatNumber(amount(lock?.lockedAmount), {
              abbreviate: false,
              fallback: '-',
            })}
          </RowParagraph>
        </Box>
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <p>{t`Unlock Time`}:</p>
          <RowParagraph>{lock?.unlockTime ? new Date(lock.unlockTime).toLocaleString() : '-'}</RowParagraph>
        </Box>
      </WithdrawInfo>

      {!canUnlock && (
        <AlertBox alertType="info" data-testid="withdraw-lock-countdown">
          {t`Your CRV unlocks in:`}
          {lock?.unlockTime && <StyledCountdown endDate={lock.unlockTime / MILLISECONDS_PER_SECOND} />}
        </AlertBox>
      )}
      <FormAlerts
        error={error}
        formErrors={form.formState.visibleErrors}
        handledErrors={[]}
        userAddress={userAddress}
      />
      <EvmFormButton
        pending={isPending}
        loading={isPending}
        disabled={isDisabled}
        label={t`Withdraw`}
        testId="withdraw-lock-submit-button"
        connectWalletTestId="vecrv-withdraw-lock-form"
      />
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
