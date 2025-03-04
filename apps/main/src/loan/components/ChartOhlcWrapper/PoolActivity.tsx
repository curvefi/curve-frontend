import { LlammaLiquidityCoins } from './types'
import { useEffect, useState } from 'react'
import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import useStore from '@/loan/store/useStore'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import Button from '@ui/Button/Button'
import Icon from '@ui/Icon'
import TradesData from '@/loan/components/ChartOhlcWrapper/TradesData'
import LiquidityData from '@/loan/components/ChartOhlcWrapper/LiquidityData'
import { ChainId } from '@/loan/types/loan.types'

interface Props {
  poolAddress: string
  chainId: ChainId
  coins: LlammaLiquidityCoins
}

const PoolActivity = ({ chainId, poolAddress, coins }: Props) => {
  const {
    activityFetchStatus,
    llammaTradesData,
    llammaControllerData,
    setActivityHidden,
    fetchPoolActivity,
    chartExpanded,
    activityHidden,
  } = useStore((state) => state.ohlcCharts)

  const [eventOption, setEventOption] = useState<'TRADE' | 'LP'>('TRADE')

  const minHeight = chartExpanded ? 548 : 330

  useEffect(() => {
    fetchPoolActivity(chainId, poolAddress)
  }, [chainId, fetchPoolActivity, poolAddress])

  return (
    <Wrapper maxHeight={`${minHeight}px`}>
      <SectionHeader>
        {chartExpanded && (
          <HidePoolActivityButton variant={'select'} onClick={() => setActivityHidden()}>
            <Icon name={activityHidden ? 'SidePanelClose' : 'SidePanelOpen'} size={16} />
          </HidePoolActivityButton>
        )}
        {!activityHidden && (
          <>
            <SectionTitle>{eventOption === 'TRADE' ? t`AMM` : t`Controller`}</SectionTitle>
            <ButtonGroup>
              <Button
                className={eventOption === 'TRADE' ? 'active' : ''}
                variant={'select'}
                onClick={() => setEventOption('TRADE')}
              >
                {t`AMM`}
              </Button>
              <Button
                className={eventOption === 'LP' ? 'active' : ''}
                variant={'select'}
                onClick={() => setEventOption('LP')}
              >
                {t`Controller`}
              </Button>
            </ButtonGroup>
          </>
        )}
      </SectionHeader>
      {!activityHidden && activityFetchStatus === 'READY' && (
        <GridContainer>
          <TitlesRow key={'titles'}>
            <EventTitle>{eventOption === 'TRADE' ? t`Swap` : t`Action`}</EventTitle>
            <TimestampColumnTitle>{t`Time`}</TimestampColumnTitle>
          </TitlesRow>
          <ElementsContainer minHeight={minHeight}>
            {eventOption === 'TRADE' ? (
              llammaTradesData.length === 0 ? (
                <SpinnerWrapper>
                  <ErrorMessage>{t`No trades data found.`}</ErrorMessage>
                </SpinnerWrapper>
              ) : (
                <TradesData llammaTradesData={llammaTradesData} chainId={chainId} />
              )
            ) : llammaControllerData.length === 0 ? (
              <SpinnerWrapper>
                <ErrorMessage>{t`No controller data found.`}</ErrorMessage>
              </SpinnerWrapper>
            ) : (
              <LiquidityData llammaControllerData={llammaControllerData} chainId={chainId} coins={coins} />
            )}
          </ElementsContainer>
        </GridContainer>
      )}
      {!activityHidden && activityFetchStatus === 'LOADING' && (
        <SpinnerWrapper minHeight={`${minHeight}px`}>
          <Spinner size={18} />
        </SpinnerWrapper>
      )}
      {!activityHidden && activityFetchStatus === 'ERROR' && (
        <SpinnerWrapper minHeight={`${minHeight}px`}>
          <ErrorMessage>{t`There was an error fetching the pool activity data.`}</ErrorMessage>
        </SpinnerWrapper>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ maxHeight: string }>`
  display: flex;
  flex-direction: column;
  max-height: ${(props) => props.maxHeight};
  margin: 1px; // align hide activity button
`

const HidePoolActivityButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: calc(-1 * var(--spacing-3) * 2.5);
  margin-right: var(--spacing-2);
  box-shadow: none;
  &:hover:not(:disabled) {
    box-shadow: none;
  }
`

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  padding-left: var(--spacing-2);
  padding-right: var(--spacing-2);
  min-height: 2.125rem;
  margin-bottom: var(--spacing-3);
`

const SectionTitle = styled.h3`
  margin: auto auto auto 0;
`

const ErrorMessage = styled.p`
  font-size: var(--font-size-2);
`

const ButtonGroup = styled.div`
  display: flex;
  font-size: var(--font-size-2);
  button {
    margin: auto 0 auto var(--spacing-2);
  }
`

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
`

const ElementsContainer = styled.div<{ minHeight: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
  border-bottom: 0.5px solid var(--border-600);
  padding: var(--spacing-1);
  min-height: ${(props) => props.minHeight}px;
`

const TitlesRow = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  padding: var(--spacing-1) var(--spacing-1);
  text-decoration: none;
  color: var(--page--text-color);
  font-weight: var(--bold);
  font-size: var(--font-size-1);
`

const EventTitle = styled.span`
  opacity: 0.7;
  box-sizing: border-box;
  grid-column: 1 / 2;
  padding: var(--spacing-1) var(--spacing-1);
`

const TimestampColumnTitle = styled.span`
  opacity: 0.7;
  box-sizing: border-box;
  grid-column: 2 / 2;
  text-align: right;
  padding: var(--spacing-1) var(--spacing-1);
`

export default PoolActivity
