import { useState } from 'react'
import { styled } from 'styled-components'
import PoolActivity from '@/dex/components/PagePool/PoolDetails/ChartOhlcWrapper/PoolActivity'
import { useOhlcChartState } from '@/dex/hooks/useOhlcChartState'
import { ChainId } from '@/dex/types/main.types'
import Box from '@ui/Box'
import Button from '@ui/Button'
import ChartWrapper from '@ui-kit/features/candle-chart/ChartWrapper'
import type { PricesApiPool } from '@ui-kit/features/candle-chart/types'
import { t } from '@ui-kit/lib/i18n'

const PoolInfoData = ({ rChainId, pricesApiPoolData }: { rChainId: ChainId; pricesApiPoolData: PricesApiPool }) => {
  const { chartCombinations, tradesTokens, chartWrapperProps } = useOhlcChartState({
    rChainId,
    pricesApiPoolData,
  })
  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')

  return (
    <Wrapper>
      <SelectorRow>
        <SelectorButton
          variant={'text'}
          className={poolInfo === 'chart' ? 'active' : ''}
          onClick={() => setPoolInfo('chart')}
        >
          {t`Chart`}
        </SelectorButton>
        <SelectorButton
          variant={'text'}
          className={poolInfo === 'poolActivity' ? 'active' : ''}
          onClick={() => setPoolInfo('poolActivity')}
        >
          {t`Pool Activity`}
        </SelectorButton>
      </SelectorRow>
      {pricesApiPoolData && poolInfo === 'poolActivity' && (
        <PoolActivity
          coins={pricesApiPoolData.coins}
          tradesTokens={tradesTokens}
          poolAddress={pricesApiPoolData.address}
          chainId={rChainId}
          chartCombinations={chartCombinations}
        />
      )}
      {poolInfo === 'chart' && <ChartWrapper {...chartWrapperProps} />}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
`

const SelectorRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: var(--spacing-2);
`

const SelectorButton = styled(Button)`
  color: inherit;
  font: var(--font);
  font-size: var(--font-size-2);
  font-weight: bold;
  text-transform: none;
  opacity: 0.7;
  &.active {
    opacity: 1;
    border-bottom: 2px solid var(--page--text-color);
  }
`

export default PoolInfoData
