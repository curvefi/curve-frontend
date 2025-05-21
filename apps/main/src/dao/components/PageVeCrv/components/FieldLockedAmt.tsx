import { useMemo } from 'react'
import styled from 'styled-components'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { CurveApi } from '@/dao/types/dao.types'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { ExternalLink } from '@ui/Link'
import { Chip } from '@ui/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'

const FieldLockedAmt = ({
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

  return (
    <div>
      <StyledInputProvider
        id="lockedAmt"
        disabled={disabled || typeof vecrvInfo === 'undefined'}
        inputVariant={lockedAmtError && 'error'}
      >
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
          <StyledExternalLink href={getInternalUrl('dex', 'ethereum', DEX_ROUTES.PAGE_SWAP)}>here</StyledExternalLink>.
        </Chip>
      ) : isAdjustCrv ? (
        <Chip size="xs">{t`CRV Locked: ${formatNumber(lockedAmount)}`}</Chip>
      ) : null}
    </div>
  )
}

const StyledInputProvider = styled(InputProvider)`
  display: grid;
  grid-template-columns: 1fr auto;
  padding: var(--spacing-1) var(--spacing-2);
`

export const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: var(--bold);

  &:hover {
    cursor: pointer;
  }
`
export default FieldLockedAmt
