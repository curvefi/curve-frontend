import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { calculateVeCrv } from '@/dao/components/PageVeCrv/utils/vecrv-calculations'
import { useLockerCrv, useLockerLockedAmountAndUnlockTime, useLockerVeCrv } from '@/dao/entities/locker-vecrv-info'
import { t } from '@evm-ui/lib/i18n'
import { HelperMessage, LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import { q } from '@evm-ui/types/util'
import { amount, decimalSum, formatNumber, MAINNET_CRV_ADDRESS, MILLISECONDS_PER_SECOND } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'

export const FieldLockedAmount = ({
  chainId,
  disabled,
  lockedAmount,
  lockedAmountError,
  noCurrentLock,
  handleInpLockedAmount,
}: {
  chainId: number
  disabled?: boolean
  lockedAmount: Decimal | undefined
  lockedAmountError: string
  noCurrentLock?: boolean
  handleInpLockedAmount: (lockedAmount: Decimal | undefined) => void
}) => {
  const { address: userAddress } = useConnection()
  const crv = useLockerCrv({ chainId, userAddress })
  const currentLock = useLockerLockedAmountAndUnlockTime({ chainId, userAddress }, !noCurrentLock)
  const currentVeCrv = useLockerVeCrv({ chainId, userAddress }, !noCurrentLock)
  const currentLockedAmount = currentLock.data?.lockedAmount
  const currentUnlockTime = maybe(currentLock.data?.unlockTime, unlockTime =>
    Math.floor(unlockTime / MILLISECONDS_PER_SECOND),
  )
  const futureVeCrv = noCurrentLock
    ? undefined
    : calculateVeCrv({
        lockedAmount: maybes([lockedAmount, currentLockedAmount], decimalSum),
        unlockTime: currentUnlockTime,
      })

  return (
    <LargeTokenInput
      name="lockedAmount"
      disabled={disabled}
      balance={q({ data: lockedAmount, isLoading: false, error: maybe(lockedAmountError, Error) })}
      message={lockedAmountError || (!noCurrentLock && currentLockedAmount && t`CRV Locked: ${currentLockedAmount}`)}
      onBalance={useCallback((balance: Decimal | undefined) => handleInpLockedAmount(balance), [handleInpLockedAmount])}
      walletBalance={{ balance: q(crv), symbol: 'CRV' }}
      tokenSelector={<TokenLabel blockchainId="ethereum" address={MAINNET_CRV_ADDRESS} label="CRV" />}
    >
      {!noCurrentLock && futureVeCrv != null && (
        <HelperMessage
          message={`${t`Future veCRV:`} ${formatNumber(amount(currentVeCrv.data), 'token.amount')} → ${formatNumber(futureVeCrv, 'token.amount')}`}
        />
      )}
    </LargeTokenInput>
  )
}
