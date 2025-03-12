import styled from 'styled-components'
import type { AdvancedSettingsProps } from '@/dex/components/AdvancedSettings'
import AdvancedSettings from '@/dex/components/AdvancedSettings'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const DetailInfoSlippageTolerance = ({ customLabel, ...props }: AdvancedSettingsProps & { customLabel?: string }) => (
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
