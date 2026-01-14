import { styled } from 'styled-components'
import { useStore } from '@/lend/store/useStore'
import { Button } from '@ui/Button'
import { TextCaption } from '@ui/TextCaption'
import { breakpoints } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  toggle?: () => void
}

export const ChartBandBalancesSettingsContent = ({ toggle }: Props) => {
  const xAxisDisplayType = useStore((state) => state.chartBands.xAxisDisplayType)
  const setStateByKey = useStore((state) => state.chartBands.setStateByKey)

  const updateXAxisDisplay = (type: 'price' | 'band') => {
    setStateByKey('xAxisDisplayType', type)
    if (typeof toggle === 'function') {
      toggle()
    }
  }

  return (
    <>
      <TextCaption isBold isCaps>
        {t`x-axis display`}
      </TextCaption>
      <ActionsWrapper>
        <ActionButton
          variant="outlined"
          className={xAxisDisplayType === 'band' ? 'active' : ''}
          onClick={() => updateXAxisDisplay('band')}
        >
          {t`band`}
        </ActionButton>{' '}
        <ActionButton
          variant="outlined"
          className={xAxisDisplayType === 'price' ? 'active' : ''}
          onClick={() => updateXAxisDisplay('price')}
        >
          {t`collateral median price`} <TextCaption>($)</TextCaption>
        </ActionButton>
      </ActionsWrapper>
    </>
  )
}

const ActionsWrapper = styled.div`
  margin-top: 0.25rem;

  @media (min-width: ${breakpoints.xxs}rem) {
    display: flex;
    grid-gap: 0.5rem;
  }
`

const ActionButton = styled(Button)`
  border-width: 2px;
  max-width: 180px;

  &.active {
    color: var(--active--border-color);
    border-color: inherit;
  }

  @media (min-width: ${breakpoints.md}rem) {
    max-width: 220px;
  }
`
