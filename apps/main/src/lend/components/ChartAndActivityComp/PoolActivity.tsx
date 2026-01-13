import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import type { LendingMarketTokens } from '@/lend/hooks/useOhlcChartState'
import { useStore } from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { Button } from '@ui/Button/Button'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import { t } from '@ui-kit/lib/i18n'
import { LiquidityData } from './LiquidityData'
import { TradesData } from './TradesData'

type PoolActivityProps = {
  poolAddress: string
  chainId: ChainId
  coins: LendingMarketTokens
}

const CHART_HEIGHT = DEFAULT_CHART_HEIGHT + 48 // 48px is the height of the section header

export const PoolActivity = ({ chainId, poolAddress, coins }: PoolActivityProps) => {
  const activityFetchStatus = useStore((state) => state.ohlcCharts.activityFetchStatus)
  const lendTradesData = useStore((state) => state.ohlcCharts.lendTradesData)
  const lendControllerData = useStore((state) => state.ohlcCharts.lendControllerData)
  const fetchPoolActivity = useStore((state) => state.ohlcCharts.fetchPoolActivity)

  const [eventOption, setEventOption] = useState<'TRADE' | 'LP'>('TRADE')

  useEffect(() => {
    void fetchPoolActivity(chainId, poolAddress)
  }, [chainId, fetchPoolActivity, poolAddress])

  return (
    <Wrapper maxHeight={`${CHART_HEIGHT}px`}>
      <SectionHeader>
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
      </SectionHeader>
      {activityFetchStatus === 'READY' && (
        <GridContainer>
          <TitlesRow key={'titles'}>
            <EventTitle>{eventOption === 'TRADE' ? t`Swap` : t`Action`}</EventTitle>
            <TimestampColumnTitle>{t`Time`}</TimestampColumnTitle>
          </TitlesRow>
          <ElementsContainer minHeight={DEFAULT_CHART_HEIGHT}>
            {eventOption === 'TRADE' ? (
              lendTradesData.length === 0 ? (
                <SpinnerWrapper>
                  <ErrorMessage>{t`No trades data found.`}</ErrorMessage>
                </SpinnerWrapper>
              ) : (
                <TradesData lendTradesData={lendTradesData} chainId={chainId} />
              )
            ) : lendControllerData.length === 0 ? (
              <SpinnerWrapper>
                <ErrorMessage>{t`No controller data found.`}</ErrorMessage>
              </SpinnerWrapper>
            ) : (
              <LiquidityData lendControllerData={lendControllerData} chainId={chainId} coins={coins} />
            )}
          </ElementsContainer>
        </GridContainer>
      )}
      {activityFetchStatus === 'LOADING' && (
        <SpinnerWrapper minHeight={`${DEFAULT_CHART_HEIGHT}px`}>
          <Spinner size={18} />
        </SpinnerWrapper>
      )}
      {activityFetchStatus === 'ERROR' && (
        <SpinnerWrapper minHeight={`${DEFAULT_CHART_HEIGHT}px`}>
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
