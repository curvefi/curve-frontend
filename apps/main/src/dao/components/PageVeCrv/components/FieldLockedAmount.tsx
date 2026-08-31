import { useCallback } from 'react'
import { useCalculateVeCrv } from '@/dao/components/PageVeCrv/queries/calculate-vecrv.query'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { CurveApi } from '@/dao/types/dao.types'
import { t } from '@evm-ui/lib/i18n'
import { HelperMessage, LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import { q } from '@evm-ui/types/util'
import { MAINNET_CRV_ADDRESS, MILLISECONDS_PER_SECOND, amount, decimal, decimalSum, formatNumber } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

export const FieldLockedAmount = ({
  curve,
  disabled,
  haveSigner,
  formType,
  lockedAmount,
  lockedAmountError,
  vecrvInfo,
  handleInpLockedAmount,
}: {
  curve: CurveApi | null
  disabled?: boolean
  haveSigner: boolean
  formType: FormType
  vecrvInfo: VecrvInfo
  lockedAmount: Decimal | undefined
  lockedAmountError: string
  handleInpLockedAmount: (lockedAmount: Decimal | undefined) => void
}) => {
  const { crv } = vecrvInfo
  const currentLockedAmount = vecrvInfo.lockedAmountAndUnlockTime.lockedAmount
  const isAdjustCrv = formType === 'adjust_crv'
  const currentUnlockTime = Math.floor(vecrvInfo.lockedAmountAndUnlockTime.unlockTime / MILLISECONDS_PER_SECOND)
  const futureVeCrv = useCalculateVeCrv({
    chainId: isAdjustCrv ? curve?.chainId : undefined,
    lockedAmount: maybe(lockedAmount, lockedAmount => decimalSum(lockedAmount, currentLockedAmount)),
    unlockTime: isAdjustCrv ? currentUnlockTime : undefined,
  })

  const onBalance = useCallback(
    (balance: Decimal | undefined) => handleInpLockedAmount(balance),
    [handleInpLockedAmount],
  )
  return (
    <LargeTokenInput
      name="lockedAmount"
      disabled={disabled}
      balance={q({ data: decimal(lockedAmount), isLoading: false, error: maybe(lockedAmountError, Error) })}
      message={lockedAmountError || (isAdjustCrv && t`CRV Locked: ${currentLockedAmount}`)}
      onBalance={onBalance}
      walletBalance={{
        balance: q({
          data: decimal(crv),
          isLoading: haveSigner && typeof crv === 'string' && String(crv).length === 0,
          error: null,
        }),
        symbol: 'CRV',
      }}
      tokenSelector={<TokenLabel blockchainId="ethereum" address={MAINNET_CRV_ADDRESS} label="CRV" />}
    >
      {isAdjustCrv && futureVeCrv.data != null && (
        <HelperMessage
          message={`${t`Future veCRV:`} ${formatNumber(amount(vecrvInfo.veCrv), 'token.amount')} → ${formatNumber(futureVeCrv.data, 'token.amount')}`}
        />
      )}
    </LargeTokenInput>
  )
}
