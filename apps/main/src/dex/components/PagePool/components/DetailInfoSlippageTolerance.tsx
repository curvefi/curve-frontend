import { useCallback } from 'react'
import { styled } from 'styled-components'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton/IconButton'
import { formatNumber } from '@ui/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useActionInfo } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { decimal } from '@ui-kit/utils'
import { SlippageSettings, SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

type Props = {
  maxSlippage: string
  stateKey: string
  customLabel?: string
}

const DetailInfoSlippageTolerance = ({ maxSlippage, stateKey, customLabel }: Props) => {
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)
  const value = decimal(maxSlippage)!

  const onSave = useCallback((slippage: string) => setMaxSlippage(slippage, stateKey), [setMaxSlippage, stateKey])

  return useActionInfo() ? (
    <SlippageToleranceActionInfo maxSlippage={value} onSave={onSave} />
  ) : (
    <StyledDetailInfo label={customLabel || t`Slippage tolerance:`}>
      <SlippageSettings
        maxSlippage={value}
        button={({ onClick }) => (
          <IconButton onClick={onClick}>
            {formatNumber(maxSlippage, { style: 'percent', defaultValue: '-' })} <Icon name="Settings" size={16} />
          </IconButton>
        )}
        onSave={onSave}
      />
    </StyledDetailInfo>
  )
}

const StyledDetailInfo = styled(DetailInfo)`
  button {
    align-items: center;
    display: inline-flex;
    min-height: 1rem;
    padding: 0;

    font-family: var(--font);
    font-weight: 400;
    font-size: var(--font-size-2);
  }
`

export default DetailInfoSlippageTolerance
