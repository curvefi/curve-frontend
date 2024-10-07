import DetailInfo from '@/ui/DetailInfo'
import Icon from '@/ui/Icon'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import styled from 'styled-components'


import AdvancedSettings from '@/components/AdvancedSettings'

type Props = {
  maxSlippage: string
}

const DetailInfoSlippageTolerance = ({ maxSlippage }: Props) => {
  return (
    <StyledDetailInfo label={t`Slippage tolerance:`}>
      <StyledAdvancedSettings
        maxSlippage={maxSlippage}
        buttonIcon={
          <>
            {formatNumber(maxSlippage, { style: 'percent', showAllFractionDigits: true, defaultValue: '-' })}&nbsp;
            <Icon name="Settings" size={16} />
          </>
        }
      />
    </StyledDetailInfo>
  )
}

const StyledAdvancedSettings = styled(AdvancedSettings)`
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
