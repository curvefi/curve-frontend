import { useCallback, useMemo } from 'react'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { CurveApi } from '@/dao/types/dao.types'
import { t } from '@evm-ui/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { HelperMessage, LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import { q } from '@evm-ui/types/util'
import { MAINNET_CRV_ADDRESS, decimal, formatNumber, amount } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

export const FieldLockedAmt = ({
  curve,
  disabled,
  haveSigner,
  formType,
  lockedAmt,
  lockedAmtError,
  vecrvInfo,
  handleInpLockedAmt,
}: {
  curve: CurveApi | null
  disabled?: boolean
  haveSigner: boolean
  formType: FormType
  vecrvInfo: VecrvInfo
  lockedAmt: string
  lockedAmtError: string
  handleInpLockedAmt: (lockedAmt: string) => void
}) => {
  const { crv } = vecrvInfo
  const { lockedAmount } = vecrvInfo.lockedAmountAndUnlockTime
  const isAdjustCrv = formType === 'adjust_crv'

  const futureVeCrv = useMemo(
    () =>
      curve?.boosting.calculateVeCrv(
        Number(lockedAmt) + Number(vecrvInfo.lockedAmountAndUnlockTime.lockedAmount),
        vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
      ),
    [curve, lockedAmt, vecrvInfo.lockedAmountAndUnlockTime],
  )

  const onBalance = useCallback(
    (balance: Decimal | undefined) => handleInpLockedAmt(balance ?? ''),
    [handleInpLockedAmt],
  )
  return (
    <LargeTokenInput
      name="lockedAmt"
      disabled={disabled}
      balance={q({ data: decimal(lockedAmt), isLoading: false, error: maybe(lockedAmtError, Error) })}
      message={
        !!crv && lockedAmtError ? (
          <>
            Amount is greater than balance ({formatNumber(amount(crv), 'token.amount')}
            ). Get more{' '}
            <RouterLink
              sx={{ color: t => t.design.Text.TextColors.FilledFeedback.Warning.Primary }}
              href={getInternalUrl('dex', 'ethereum', DEX_ROUTES.PAGE_SWAP)}
            >
              here
            </RouterLink>
            .
          </>
        ) : (
          isAdjustCrv && t`CRV Locked: ${lockedAmount}`
        )
      }
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
      {isAdjustCrv && lockedAmt && Number(lockedAmt) != 0 && futureVeCrv != null && (
        <HelperMessage
          message={`${t`Future veCRV:`} ${formatNumber(amount(vecrvInfo.veCrv), 'token.amount')} → ${formatNumber(futureVeCrv, 'token.amount')}`}
        />
      )}
    </LargeTokenInput>
  )
}
