import { useCallback, useMemo } from 'react'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { CurveApi } from '@/dao/types/dao.types'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { HelperMessage, LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { CRV_ADDRESS, decimal } from '@ui-kit/utils'

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
      balance={decimal(lockedAmt)}
      isError={!!lockedAmtError}
      message={
        !!crv && lockedAmtError ? (
          <>
            Amount is greater than balance ({formatNumber(crv)}). Get more{' '}
            <RouterLink
              sx={{ color: (t) => t.design.Text.TextColors.FilledFeedback.Warning.Primary }}
              href={getInternalUrl('dex', 'ethereum', DEX_ROUTES.PAGE_SWAP)}
            >
              here
            </RouterLink>
            .
          </>
        ) : (
          isAdjustCrv && t`CRV Locked: ${formatNumber(lockedAmount)}`
        )
      }
      onBalance={onBalance}
      walletBalance={{
        balance: decimal(crv),
        loading: haveSigner && crv === '',
        symbol: 'CRV',
      }}
      tokenSelector={<TokenLabel blockchainId="ethereum" address={CRV_ADDRESS} label="CRV" />}
    >
      {isAdjustCrv && lockedAmt && Number(lockedAmt) != 0 && futureVeCrv != null && (
        <HelperMessage
          message={`${t`Future veCRV:`} ${formatNumber(vecrvInfo.veCrv)} → ${formatNumber(futureVeCrv)}`}
        />
      )}
    </LargeTokenInput>
  )
}
