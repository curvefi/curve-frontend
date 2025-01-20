import type { LpTradeToken, PricesApiCoin } from '@ui/Chart/types'

import { useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import useStore from '@main/store/useStore'

import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import Button from '@ui/Button/Button'
import Icon from '@ui/Icon'
import TradesData from '@main/components/PagePool/PoolDetails/ChartOhlcWrapper/TradesData'
import LiquidityData from '@main/components/PagePool/PoolDetails/ChartOhlcWrapper/LiquidityData'
import { ChainId } from '@main/types/main.types'

const PoolActivity: React.FC<{
  poolAddress: string
  chainId: ChainId
  chartExpanded: boolean
  coins: PricesApiCoin[]
  tradesTokens: LpTradeToken[]
  chartCombinations: PricesApiCoin[][]
  refetchPricesData: () => void
}> = ({ chainId, poolAddress, chartExpanded, coins, tradesTokens, chartCombinations, refetchPricesData }) => {
  const activityHidden = useStore((state) => state.pools.pricesApiState.activityHidden)
  const {
    pricesApiState: { activityStatus, tradeEventsData, liquidityEventsData },
    setActivityHidden,
    fetchPricesApiActivity,
  } = useStore((state) => state.pools)

  const [eventOption, setEventOption] = useState<'TRADE' | 'LP'>('TRADE')

  useEffect(() => {
    fetchPricesApiActivity(chainId, poolAddress, chartCombinations)
  }, [chainId, chartCombinations, fetchPricesApiActivity, poolAddress])

  return (
    <Wrapper chartExpanded={chartExpanded}>
      <SectionHeader>
        {chartExpanded && (
          <HidePoolActivityButton variant={'select'} onClick={() => setActivityHidden(!activityHidden)}>
            <Icon name={activityHidden ? 'SidePanelClose' : 'SidePanelOpen'} size={16} />
          </HidePoolActivityButton>
        )}
        {!activityHidden && (
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
        )}
      </SectionHeader>
      {!activityHidden && activityStatus === 'READY' && (
        <GridContainer>
          <TitlesRow key={'titles'}>
            <EventTitle>{eventOption === 'TRADE' ? t`Swap` : t`Action`}</EventTitle>
            <TimestampColumnTitle>{t`Time`}</TimestampColumnTitle>
          </TitlesRow>
          <ElementsContainer minHeight={chartExpanded ? 548 : 330}>
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
      {!activityHidden && activityStatus === 'LOADING' && (
        <SpinnerWrapper minHeight={chartExpanded ? '548px' : '330px'}>
          <Spinner size={18} />
        </SpinnerWrapper>
      )}
      {!activityHidden && activityStatus === 'ERROR' && (
        <SpinnerWrapper minHeight={chartExpanded ? '548px' : '330px'}>
          <ErrorMessage>{t`There was an error fetching the pool activity data.`}</ErrorMessage>
        </SpinnerWrapper>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ chartExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  max-height: ${(props) => (props.chartExpanded ? '548px' : '350px')};
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
