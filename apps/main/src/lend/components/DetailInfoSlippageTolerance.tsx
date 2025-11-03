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
}

const DetailInfoSlippageTolerance = ({ maxSlippage }: Props) => {
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)
  const value = decimal(maxSlippage)!

  return useActionInfo() ? (
    <SlippageToleranceActionInfo maxSlippage={value} onSave={setMaxSlippage} />
  ) : (
    <StyledDetailInfo label={t`Slippage tolerance:`}>
      <SlippageSettings
        maxSlippage={value}
        button={({ onClick }) => (
          <IconButton onClick={onClick}>
            {formatNumber(maxSlippage, { style: 'percent', defaultValue: '-' })} <Icon name="Settings" size={16} />
          </IconButton>
        )}
        onSave={setMaxSlippage}
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
