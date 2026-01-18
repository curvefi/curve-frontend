import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { LiquidityData } from '@/loan/components/ChartOhlcWrapper/LiquidityData'
import { TradesData } from '@/loan/components/ChartOhlcWrapper/TradesData'
import { useStore } from '@/loan/store/useStore'
import { ChainId } from '@/loan/types/loan.types'
import { Button } from '@ui/Button/Button'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { t } from '@ui-kit/lib/i18n'
import { LlammaLiquidityCoins } from './types'

interface Props {
  poolAddress: string
  chainId: ChainId
  coins: LlammaLiquidityCoins
}

const MIN_HEIGHT = 330

export const PoolActivity = ({ chainId, poolAddress, coins }: Props) => {
  const activityFetchStatus = useStore((state) => state.ohlcCharts.activityFetchStatus)
  const llammaTradesData = useStore((state) => state.ohlcCharts.llammaTradesData)
  const llammaControllerData = useStore((state) => state.ohlcCharts.llammaControllerData)
  const fetchPoolActivity = useStore((state) => state.ohlcCharts.fetchPoolActivity)

  const [eventOption, setEventOption] = useState<'TRADE' | 'LP'>('TRADE')

  useEffect(() => {
    fetchPoolActivity(chainId, poolAddress)
  }, [chainId, fetchPoolActivity, poolAddress])

  return (
    <Wrapper maxHeight={`${MIN_HEIGHT}px`}>
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
          <ElementsContainer minHeight={MIN_HEIGHT}>
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
      {activityFetchStatus === 'LOADING' && (
        <SpinnerWrapper minHeight={`${MIN_HEIGHT}px`}>
          <Spinner size={18} />
        </SpinnerWrapper>
      )}
      {activityFetchStatus === 'ERROR' && (
        <SpinnerWrapper minHeight={`${MIN_HEIGHT}px`}>
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
