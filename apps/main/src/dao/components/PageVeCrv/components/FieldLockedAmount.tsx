import { useConnection } from 'wagmi'
import { calculateVeCrv } from '@/dao/components/PageVeCrv/utils/vecrv-calculations'
import { useLockerCrv, useLockerLockedAmountAndUnlockTime, useLockerVeCrv } from '@/dao/entities/locker-vecrv-info'
import { t } from '@evm-ui/lib/i18n'
import { HelperMessage, LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import { q } from '@evm-ui/types/util'
import { amount, decimalSum, formatNumber, MAINNET_CRV, MILLISECONDS_PER_SECOND } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'

export const FieldLockedAmount = ({
  chainId,
  disabled,
  lockedAmount,
  lockedAmountError,
  noCurrentLock,
  onBalance,
}: {
  chainId: number
  disabled?: boolean
  lockedAmount: Decimal | undefined
  lockedAmountError: string | undefined
  noCurrentLock?: boolean
  onBalance: (lockedAmount: Decimal | undefined) => void
}) => {
  const { address: userAddress } = useConnection()
  const crv = useLockerCrv({ chainId, userAddress })
  const currentLock = useLockerLockedAmountAndUnlockTime({ chainId, userAddress }, !noCurrentLock)
  const currentVeCrv = useLockerVeCrv({ chainId, userAddress }, !noCurrentLock)
  const currentLockedAmount = currentLock.data?.lockedAmount

  const futureVeCrv = noCurrentLock
    ? undefined
    : calculateVeCrv({
        lockedAmount: maybes([lockedAmount, currentLockedAmount], decimalSum),
        unlockTime: maybe(currentLock.data, ({ unlockTime }) => Math.floor(unlockTime / MILLISECONDS_PER_SECOND)),
      })

  return (
    <LargeTokenInput
      name="lockedAmount"
      disabled={disabled}
      balance={q({ data: lockedAmount, isLoading: false, error: maybe(lockedAmountError, Error) ?? null })}
      message={lockedAmountError || (!noCurrentLock && currentLockedAmount && t`CRV Locked: ${currentLockedAmount}`)}
      onBalance={onBalance}
      walletBalance={{ balance: q(crv), symbol: 'CRV' }}
      tokenSelector={
        <TokenLabel blockchainId={MAINNET_CRV.chain} address={MAINNET_CRV.address} label={MAINNET_CRV.symbol} />
      }
    >
      {!noCurrentLock && futureVeCrv != null && (
        <HelperMessage
          message={`${t`Future veCRV:`} ${formatNumber(amount(currentVeCrv.data), 'token.amount')} → ${formatNumber(futureVeCrv, 'token.amount')}`}
        />
      )}
    </LargeTokenInput>
  )
}
