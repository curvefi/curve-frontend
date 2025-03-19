import styled from 'styled-components'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import { formatNumber } from '@ui/utils'
import { SlippageSettings } from '@ui-kit/features/slippage-settings'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  maxSlippage: string
  stateKey: string
  customLabel?: string
}

const DetailInfoSlippageTolerance = ({ maxSlippage, stateKey, customLabel }: Props) => (
  <StyledDetailInfo label={customLabel || t`Slippage tolerance:`}>
    <StyledSlippageSettings
      maxSlippage={maxSlippage}
      stateKey={stateKey}
      buttonIcon={
        <>
          {formatNumber(maxSlippage, { style: 'percent', showAllFractionDigits: true, defaultValue: '-' })}{' '}
          <Icon name="Settings" size={16} />
        </>
      }
    />
  </StyledDetailInfo>
)

const StyledSlippageSettings = styled(SlippageSettings)`
  justify-content: flex-end;
`

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
