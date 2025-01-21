import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@main/store/useStore'
import { checkFormReady } from '@main/components/PageCreatePool/utils'

import Icon from '@ui/Icon'
import Button from '@ui/Button'
import ConfirmModal from '@main/components/PageCreatePool/ConfirmModal'
import { CurveApi, ChainId } from '@main/types/main.types'

interface Props {
  navigation: number
  setNavigation: (index: number) => void
  disabled?: boolean
  imageBaseUrl: string
  chainId: ChainId
  curve: CurveApi
}

const Navigation = ({ navigation, setNavigation, imageBaseUrl, chainId, curve }: Props) => {
  const createPoolState = useStore((state) => state.createPool)
  const { validation } = createPoolState

  return (
    <NavigationStyles>
      <ButtonStyles className={navigation === 0 ? 'active' : ''} nowrap size={'small'} onClick={() => setNavigation(0)}>
        {validation.poolType && <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />}
        <p className="button-text">{t`POOL TYPE`}</p>
        <Icon name={'ChevronRight'} size={16} className="navigation-icon" aria-label={t`Chevron right`} />
      </ButtonStyles>
      <ButtonStyles
        className={navigation === 1 ? 'active' : ''}
        nowrap
        size={'small'}
        onClick={() => setNavigation(1)}
        disabled={!validation.poolType}
      >
        {validation.poolType && validation.tokensInPool && (
          <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
        )}
        <p className="button-text">{t`TOKENS IN POOL`}</p>
        <Icon name={'ChevronRight'} size={16} className="navigation-icon" aria-label={t`Chevron right`} />
      </ButtonStyles>
      <ButtonStyles
        className={navigation === 2 ? 'active' : ''}
        nowrap
        size={'small'}
        onClick={() => setNavigation(2)}
        disabled={!validation.poolType || !validation.tokensInPool}
      >
        {validation.poolType && validation.tokensInPool && validation.parameters && (
          <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
        )}
        <p className="button-text">{t`PARAMETERS`}</p>
        <Icon name={'ChevronRight'} size={16} className="navigation-icon" aria-label={t`Chevron right`} />
      </ButtonStyles>
      <ButtonStyles
        className={navigation === 3 ? 'active' : ''}
        nowrap
        size={'small'}
        onClick={() => setNavigation(3)}
        disabled={!validation.poolType || !validation.tokensInPool || !validation.parameters}
      >
        {checkFormReady(validation.poolType, validation.tokensInPool, validation.parameters, validation.poolInfo) && (
          <StyledCheckmark name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
        )}
        <p className="button-text">{t`POOL INFO`}</p>
        <Icon name={'ChevronRight'} size={16} className="navigation-icon" aria-label={t`Chevron right`} />
      </ButtonStyles>
      <SummaryContainer>
        <ConfirmModal smallScreen chainId={chainId} curve={curve} imageBaseUrl={imageBaseUrl} />
      </SummaryContainer>
    </NavigationStyles>
  )
}

const NavigationStyles = styled.div`
  display: flex;
  flex-direction: row;
  background: var(--box--primary--background);
  justify-content: flex-start;
  padding: 0 var(--spacing-narrow) 0 var(--spacing-1);
  @media (min-width: 39.375rem) {
    padding: var(--spacing-narrow) var(--spacing-4);
    justify-content: space-between;
  }
`

const SummaryContainer = styled.div`
  margin: var(--spacing-3) 0 var(--spacing-3) auto;
  display: flex;
  @media (min-width: 39.375rem) {
    display: none;
  }
`

const StyledCheckmark = styled(Icon)`
  @media (min-width: 68.75rem) {
    display: none;
  }
`

const ButtonStyles = styled(Button)`
  display: none;
  align-items: center;
  font-size: var(--font-size-1);
  padding: var(--spacing-1) var(--spacing-2);
  color: var(--box--primary--color);
  font-weight: 700;
  background: none;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  @media (min-width: 39.375rem) {
    display: flex;
  }
  @media (min-width: 38.5rem) {
    padding: var(--spacing-1) var(--spacing-2);
  }
  @media (min-width: 46.875rem) {
    padding: var(--spacing-2) var(--spacing-3);
  }
  &.active,
  &.active:hover,
  &:hover {
    display: flex;
    color: var(--box--primary--color);
    font-size: var(--font-size-2);
    @media (min-width: 39.375rem) {
      font-size: var(--font-size-1);
      color: var(--nav_link--active--hover--color);
      background-color: var(--nav_link--active--hover--background-color);
    }
  }
  .button-text {
    margin: 0.646px calc(var(--spacing-1) / 2) 0 var(--spacing-1);
  }
  .navigation-icon {
    display: none;
    @media (min-width: 44.375rem) {
      display: block;
    }
  }
`

export default Navigation
