import type { AdvancedSettingsProps } from '@/components/AdvancedSettings'

import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'

import DetailInfo from '@/ui/DetailInfo'
import AdvancedSettings from '@/components/AdvancedSettings'
import Icon from '@/ui/Icon'

const DetailInfoSlippageTolerance = ({ customLabel, ...props }: AdvancedSettingsProps & { customLabel?: string }) => {
  return (
    <StyledDetailInfo label={customLabel || t`Slippage tolerance:`}>
      <StyledAdvancedSettings
        {...props}
        buttonIcon={
          <>
            {formatNumber(props.maxSlippage, { style: 'percent', showAllFractionDigits: true, defaultValue: '-' })}{' '}
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
