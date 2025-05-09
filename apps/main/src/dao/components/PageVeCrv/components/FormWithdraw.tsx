import { ReactNode, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import AlertFormError from '@/dao/components/AlertFormError'
import FormActions from '@/dao/components/PageVeCrv/components/FormActions'
import type { PageVecrv } from '@/dao/components/PageVeCrv/types'
import VoteCountdown from '@/dao/components/VoteCountdown'
import { useLockEstimateWithdrawGas } from '@/dao/entities/locker-estimate-withdraw-gas'
import useEstimateGasConversion from '@/dao/hooks/useEstimateGasConversion'
import useStore from '@/dao/store/useStore'
import { Address } from '@curvefi/prices-api'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import Box from '@ui/Box'
import Button from '@ui/Button'
import TxInfoBar from '@ui/TxInfoBar'
import { formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const FormWithdraw = ({ curve, rChainId, vecrvInfo }: PageVecrv) => {
  const withdrawLockedCrv = useStore((state) => state.lockedCrv.withdrawLockedCrv)
  const withdrawLockedCrvStatus = useStore((state) => state.lockedCrv.withdrawLockedCrvStatus)

  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = curve ?? {}
  const haveSigner = !!signerAddress
  const canUnlock =
    +vecrvInfo.lockedAmountAndUnlockTime.lockedAmount > 0 && vecrvInfo.lockedAmountAndUnlockTime.unlockTime < Date.now()
  const {
    data: lockEstimateWithdrawGas,
    isSuccess: isSuccessLockEstimateWithdrawGas,
    isLoading: isLoadingLockEstimateWithdrawGas,
    isError: isErrorLockEstimateWithdrawGas,
  } = useLockEstimateWithdrawGas({ chainId: rChainId, walletAddress: signerAddress as Address }, canUnlock)

  const { estGasCostUsd, tooltip } = useEstimateGasConversion(lockEstimateWithdrawGas ?? 0)
  const valueGas = formatNumber(estGasCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  const closeTxBar = useCallback(() => {
    setTxInfoBar(null)
  }, [setTxInfoBar])

  const handleWithdraw = useCallback(() => {
    withdrawLockedCrv()
  }, [withdrawLockedCrv])

  useEffect(() => {
    if (withdrawLockedCrvStatus.transactionState === 'SUCCESS') {
      setTxInfoBar(
        <TxInfoBar
          description={t`Withdraw locked CRV`}
          txHash={withdrawLockedCrvStatus.txHash ?? ''}
          onClose={closeTxBar}
        />,
      )
    }
  }, [
    withdrawLockedCrvStatus.transactionState,
    closeTxBar,
    withdrawLockedCrvStatus.txHash,
    withdrawLockedCrvStatus.errorMessage,
  ])

  const loading = typeof vecrvInfo === 'undefined'
  const transactionLoading =
    withdrawLockedCrvStatus.transactionState === 'CONFIRMING' || withdrawLockedCrvStatus.transactionState === 'LOADING'

  return (
    <>
      <WithdrawInfo display="flex" flexDirection="column" flexGap="var(--spacing-1)">
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <RowTitle>{t`CRV Locked`}:</RowTitle>
          <p>{formatNumber(vecrvInfo.lockedAmountAndUnlockTime.lockedAmount)}</p>
        </Box>
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <RowTitle>{t`Unlock Time`}:</RowTitle>
          <p>{new Date(vecrvInfo.lockedAmountAndUnlockTime.unlockTime).toLocaleString()}</p>
        </Box>
        <Box display="flex" flexAlignItems="center" flexJustifyContent="space-between">
          <RowTitle>{t`Unlocks In`}:</RowTitle>
          <VoteCountdown startDate={vecrvInfo.lockedAmountAndUnlockTime.unlockTime / 1000} />
        </Box>
      </WithdrawInfo>

      {haveSigner && (
        <ActionInfo
          label={t`Estimated TX cost`}
          labelColor="tertiary"
          value={valueGas !== '' && valueGas !== '0' ? valueGas : '-'}
          valueColor="tertiary"
          valueLeft={<LocalFireDepartmentIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}
          valueTooltip={tooltip}
          loading={isLoadingLockEstimateWithdrawGas}
        />
      )}

      <FormActions haveSigner={haveSigner} loading={loading}>
        {withdrawLockedCrvStatus.transactionState === 'ERROR' && withdrawLockedCrvStatus.errorMessage && (
          <AlertFormError errorKey={withdrawLockedCrvStatus.errorMessage} handleBtnClose={() => closeTxBar()} />
        )}
        {txInfoBar}
        <Button
          fillWidth
          size="large"
          variant="filled"
          disabled={!canUnlock}
          loading={transactionLoading}
          onClick={() => handleWithdraw()}
        >
          Withdraw
        </Button>
      </FormActions>
    </>
  )
}

const WithdrawInfo = styled(Box)`
  p {
    font-size: var(--font-size-2);
  }
`

const RowTitle = styled.p`
  font-weight: var(--bold);
`

export default FormWithdraw
