import { styled } from 'styled-components'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton/IconButton'
import { formatNumber } from '@ui/utils'
import { SlippageSettings } from '@ui-kit/features/slippage-settings'
import { SlippageToleranceActionInfo } from '@ui-kit/features/slippage-settings'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { decimal, ReleaseChannel } from '@ui-kit/utils'

type Props = {
  maxSlippage: string
}

const DetailInfoSlippageTolerance = ({ maxSlippage }: Props) => {
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)
  const [releaseChannel] = useReleaseChannel()
  const value = decimal(maxSlippage)!

  if (releaseChannel === ReleaseChannel.Beta) {
    return <SlippageToleranceActionInfo maxSlippage={value} onSave={setMaxSlippage} />
  }

  return (
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
