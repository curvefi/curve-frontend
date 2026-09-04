import { useConnection } from 'wagmi'
import { useLockerCrv, useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { MAINNET_CRV } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

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
  const currentLockedAmount = currentLock.data?.lockedAmount

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
    />
  )
}
