import { ReactNode, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import { AlertFormError } from '@/dao/components/AlertFormError'
import { Countdown } from '@/dao/components/Countdown'
import { FormActions } from '@/dao/components/PageVeCrv/components/FormActions'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import { useLockEstimateWithdrawGas } from '@/dao/entities/locker-estimate-withdraw-gas'
import { useEstimateGasConversion } from '@/dao/hooks/useEstimateGasConversion'
import { useStore } from '@/dao/store/useStore'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getIsLockExpired } from '@ui-kit/utils/vecrv'

const { IconSize } = SizesAndSpaces

export const FormWithdraw = ({ rChainId, vecrvInfo }: PageVecrv) => {
  const withdrawLockedCrv = useStore((state) => state.lockedCrv.withdrawLockedCrv)
  const withdrawLockedCrvStatus = useStore((state) => state.lockedCrv.withdrawLockedCrvStatus)
  const [txInfoBar, setTxInfoBar] = useState<ReactNode | null>(null)

  const { address } = useConnection()

  const haveSigner = !!address
  const canUnlock = getIsLockExpired(
    vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
    vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
  )
  const { data: lockEstimateWithdrawGas, isLoading: isLoadingLockEstimateWithdrawGas } = useLockEstimateWithdrawGas(
    { chainId: rChainId, userAddress: address },
    canUnlock,
  )

  const loading = typeof vecrvInfo === 'undefined'
  const withdrawTxLoading =
    withdrawLockedCrvStatus.transactionState === 'CONFIRMING' || withdrawLockedCrvStatus.transactionState === 'LOADING'
  const withdrawTxError = withdrawLockedCrvStatus.transactionState === 'ERROR'
  const withdrawTxSuccess = withdrawLockedCrvStatus.transactionState === 'SUCCESS'

  const { estGasCostUsd, tooltip } = useEstimateGasConversion(lockEstimateWithdrawGas)
  const valueGas = formatNumber(estGasCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  useEffect(() => {
    if (withdrawTxSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTxInfoBar(
        <TxInfoBar
          description={t`Locked CRV withdrawn`}
          txHash={withdrawLockedCrvStatus.txHash ?? ''}
          onClose={() => setTxInfoBar(null)}
        />,
      )
    }
  }, [withdrawTxSuccess, withdrawLockedCrvStatus.txHash])

  return (
    <Box display="flex" flexDirection="column" flexGap="var(--spacing-3)" fillHeight>
      <WithdrawInfo display="flex" flexDirection="column" flexGap="var(--spacing-1)">
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <p>{t`CRV Locked`}:</p>
          <RowParagraph>{formatNumber(vecrvInfo.lockedAmountAndUnlockTime.lockedAmount)}</RowParagraph>
        </Box>
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <p>{t`Unlock Time`}:</p>
          <RowParagraph>{new Date(vecrvInfo.lockedAmountAndUnlockTime.unlockTime).toLocaleString()}</RowParagraph>
        </Box>
      </WithdrawInfo>

      <Box display="flex" flexDirection="column" margin="auto 0 0" flexGap="var(--spacing-3)">
        {haveSigner && canUnlock && (
          <ActionInfo
            label={t`Estimated TX cost`}
            labelColor="tertiary" // Change the label color to tertiary to work together with legacy background colors until we can fully upgrade to the new design system
            value={valueGas !== '' && valueGas !== '0' ? `$${valueGas}` : '-'}
            valueColor="tertiary"
            valueLeft={<LocalFireDepartmentIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}
            valueTooltip={tooltip}
            loading={isLoadingLockEstimateWithdrawGas}
          />
        )}
        <FormActions haveSigner={haveSigner} loading={loading}>
          {!canUnlock && (
            <AlertBox alertType="info">
              {t`Your CRV unlocks in:`}
              <StyledCountdown endDate={vecrvInfo.lockedAmountAndUnlockTime.unlockTime / 1000} />
            </AlertBox>
          )}
          {withdrawTxError && withdrawLockedCrvStatus.errorMessage && (
            <AlertFormError errorKey={withdrawLockedCrvStatus.errorMessage} />
          )}
          {txInfoBar}
          {withdrawTxSuccess && <SuccessBox>{t`Withdrawal successful`}</SuccessBox>}
          {!withdrawTxSuccess && canUnlock && (
            <Button
              fillWidth
              size="large"
              variant="filled"
              disabled={!canUnlock}
              loading={withdrawTxLoading}
              onClick={() => withdrawLockedCrv()}
            >
              {t`Withdraw`}
            </Button>
          )}
        </FormActions>
      </Box>
    </Box>
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

// mimics StepBox from StepAction.tsx
const SuccessBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1) var(--spacing-2);
  min-height: var(--height-large);
  font-size: var(--box_action--button--font-size);
  font-weight: var(--button--font-weight);
  width: 100%;
  color: var(--success-400);
  border: 2px solid var(--success-400);
  background-color: var(--success-600);
  text-align: center;
`
