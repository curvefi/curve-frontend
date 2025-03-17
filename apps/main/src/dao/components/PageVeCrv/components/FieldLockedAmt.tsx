import styled from 'styled-components'
import type { FormType, VecrvInfo } from '@/dao/components/PageVeCrv/types'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { ExternalLink } from '@ui/Link'
import { Chip } from '@ui/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { getAppRoot } from '@ui-kit/shared/routes'

const FieldLockedAmt = ({
  disabled,
  haveSigner,
  formType,
  lockedAmt,
  lockedAmtError,
  vecrvInfo,
  handleInpLockedAmt,
}: {
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
      {!!crv && lockedAmtError ? (
        <Chip size="xs" isError>
          Amount is greater than balance ({formatNumber(crv)}). Get more{' '}
          <StyledExternalLink href={getAppRoot('dex')}>here</StyledExternalLink>.
        </Chip>
      ) : formType === 'adjust_crv' ? (
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
