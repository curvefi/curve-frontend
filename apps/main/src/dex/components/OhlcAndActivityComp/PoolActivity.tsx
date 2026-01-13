import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { LiquidityData } from '@/dex/components/OhlcAndActivityComp/LiquidityData'
import { TradesData } from '@/dex/components/OhlcAndActivityComp/TradesData'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { Button } from '@ui/Button/Button'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import type { LpTradeToken, PricesApiCoin } from '@ui-kit/features/candle-chart/types'
import { t } from '@ui-kit/lib/i18n'

type PoolActivityProps = {
  poolAddress: string
  chainId: ChainId
  coins: PricesApiCoin[]
  tradesTokens: LpTradeToken[]
  chartCombinations: PricesApiCoin[][]
}

const CHART_HEIGHT = DEFAULT_CHART_HEIGHT + 48 // 48px is the height of the section header

export const PoolActivity = ({ chainId, poolAddress, coins, tradesTokens, chartCombinations }: PoolActivityProps) => {
  const activityStatus = useStore((state) => state.pools.pricesApiState.activityStatus)
  const tradeEventsData = useStore((state) => state.pools.pricesApiState.tradeEventsData)
  const liquidityEventsData = useStore((state) => state.pools.pricesApiState.liquidityEventsData)
  const fetchPricesApiActivity = useStore((state) => state.pools.fetchPricesApiActivity)

  const [eventOption, setEventOption] = useState<'TRADE' | 'LP'>('TRADE')

  useEffect(() => {
    fetchPricesApiActivity(chainId, poolAddress, chartCombinations)
  }, [chainId, chartCombinations, fetchPricesApiActivity, poolAddress])

  return (
    <Wrapper maxHeight={`${CHART_HEIGHT}px`}>
      <SectionHeader>
        <>
          <SectionTitle>{eventOption === 'TRADE' ? t`Swaps` : t`Liquidity`}</SectionTitle>
          <ButtonGroup>
            <Button
              className={eventOption === 'TRADE' ? 'active' : ''}
              variant={'select'}
              onClick={() => setEventOption('TRADE')}
            >
              {t`Swaps`}
            </Button>
            <Button
              className={eventOption === 'LP' ? 'active' : ''}
              variant={'select'}
              onClick={() => setEventOption('LP')}
            >
              {t`Liquidity`}
            </Button>
          </ButtonGroup>
        </>
      </SectionHeader>
      {activityStatus === 'READY' && (
        <GridContainer>
          <TitlesRow key={'titles'}>
            <EventTitle>{eventOption === 'TRADE' ? t`Swap` : t`Action`}</EventTitle>
            <TimestampColumnTitle>{t`Time`}</TimestampColumnTitle>
          </TitlesRow>
          <ElementsContainer minHeight={DEFAULT_CHART_HEIGHT}>
            {eventOption === 'TRADE' ? (
              tradeEventsData.length === 0 ? (
                <SpinnerWrapper>
                  <ErrorMessage>{t`No trades data found.`}</ErrorMessage>
                </SpinnerWrapper>
              ) : (
                <TradesData lpTradesData={tradeEventsData} chainId={chainId} tradesTokens={tradesTokens} />
              )
            ) : liquidityEventsData.length === 0 ? (
              <SpinnerWrapper>
                <ErrorMessage>{t`No controller data found.`}</ErrorMessage>
              </SpinnerWrapper>
            ) : (
              <LiquidityData lpEventsData={liquidityEventsData} chainId={chainId} coins={coins} />
            )}
          </ElementsContainer>
        </GridContainer>
      )}
      {activityStatus === 'LOADING' && (
        <SpinnerWrapper minHeight={`${DEFAULT_CHART_HEIGHT}px`}>
          <Spinner size={18} />
        </SpinnerWrapper>
      )}
      {activityStatus === 'ERROR' && (
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
