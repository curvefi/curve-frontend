import { styled } from 'styled-components'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton/IconButton'
import { formatNumber } from '@ui/utils'
import { SlippageSettings } from '@ui-kit/features/slippage-settings'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { ReleaseChannel } from '@ui-kit/utils'

type Props = {
  maxSlippage: string
}

const NewDetailInfoSlippageTolerance = ({ maxSlippage }: Props) => {
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)

  return (
    <ActionInfo
      label={t`Slippage tolerance:`}
      value={
        <SlippageSettings
          maxSlippage={maxSlippage}
          button={({ onClick }) => (
            <IconButton onClick={onClick}>
              {formatNumber(maxSlippage, { style: 'percent', defaultValue: '-' })} <Icon name="Settings" size={16} />
            </IconButton>
          )}
          onSave={setMaxSlippage}
        />
      }
    />
  )
}

const OldDetailInfoSlippageTolerance = ({ maxSlippage }: Props) => {
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)

  return (
    <StyledDetailInfo label={t`Slippage tolerance:`}>
      <SlippageSettings
        maxSlippage={maxSlippage}
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

export default function DetailInfoSlippageTolerance(props: Props) {
  const [releaseChannel] = useReleaseChannel()
  const DetailInfo =
    releaseChannel === ReleaseChannel.Beta ? NewDetailInfoSlippageTolerance : OldDetailInfoSlippageTolerance
  return <DetailInfo {...props} />
}
