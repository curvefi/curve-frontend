import { useCallback, useMemo } from 'react'
import { styled } from 'styled-components'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { CurveApi } from '@/dao/types/dao.types'
import { InputDebounced, InputMaxBtn, InputProvider } from '@ui/InputComp'
import { Chip } from '@ui/Typography'
import { formatNumber } from '@ui/utils'
import { useLegacyTokenInput } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { CRV_ADDRESS, decimal, type Decimal } from '@ui-kit/utils'

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
  return useLegacyTokenInput() ? (
    <div>
      <StyledInputProvider id="lockedAmt" disabled={disabled} inputVariant={lockedAmtError && 'error'}>
        <InputDebounced
          id="inpLockedAmt"
          labelProps={{
            label: haveSigner ? t`CRV Avail.` : 'CRV',
            descriptionLoading: haveSigner ? crv === '' : false,
            description: haveSigner ? formatNumber(crv) : '',
          }}
          onChange={handleInpLockedAmt}
          value={lockedAmt}
        />
        <InputMaxBtn type="button" onClick={() => handleInpLockedAmt(crv)} />
      </StyledInputProvider>
      {isAdjustCrv && lockedAmt && lockedAmt !== '0' && lockedAmt !== '0.0' && typeof futureVeCrv === 'number' && (
        <>
          <Chip size="xs">
            {t`Future veCRV:`} {`${formatNumber(vecrvInfo.veCrv)} → `} {formatNumber(futureVeCrv)}
          </Chip>
          <br />
        </>
      )}
      {!!crv && lockedAmtError ? (
        <Chip size="xs" isError>
          Amount is greater than balance ({formatNumber(crv)}). Get more{' '}
          <RouterLink href={getInternalUrl('dex', 'ethereum', DEX_ROUTES.PAGE_SWAP)}>here</RouterLink>.
        </Chip>
      ) : isAdjustCrv ? (
        <Chip size="xs">{t`CRV Locked: ${formatNumber(lockedAmount)}`}</Chip>
      ) : null}
    </div>
  ) : (
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
        ) : isAdjustCrv ? (
          t`CRV Locked: ${formatNumber(lockedAmount)}`
        ) : undefined
      }
      onBalance={onBalance}
      walletBalance={{
        balance: decimal(crv),
        loading: haveSigner && crv === '',
        symbol: 'CRV',
      }}
      tokenSelector={<TokenLabel blockchainId="ethereum" address={CRV_ADDRESS} label="CRV" />}
    />
  )
}

const StyledInputProvider = styled(InputProvider)`
  display: grid;
  grid-template-columns: 1fr auto;
  padding: var(--spacing-1) var(--spacing-2);
`
