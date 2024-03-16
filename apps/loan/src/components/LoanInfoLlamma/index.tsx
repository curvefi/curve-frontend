import type { PageLoanManageProps } from '@/components/PageLoanManage/types'
import type { BrushStartEndIndex } from '@/components/ChartBandBalances/types'

import { t } from '@lingui/macro'
import React, { useMemo, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import useStore from '@/store/useStore'

import { SubTitle } from '@/components/LoanInfoLlamma/styles'
import ChartBandBalances from '@/components/ChartBandBalances'
import DetailInfoAddressLookup from '@/components/LoanInfoLlamma/components/DetailInfoAddressLookup'
import LoanInfoParameters from '@/components/LoanInfoLlamma/LoanInfoParameters'
import PoolInfoData from '@/components/PoolInfoData'

interface Props extends Pick<PageLoanManageProps, 'llamma' | 'llammaId' | 'rChainId'> {
  className?: string
}

const DEFAULT_BAND_CHART_DATA = {
  collateral: '0',
  collateralUsd: '0',
  isLiquidationBand: '',
  isOraclePriceBand: false,
  isNGrouped: false,
  n: '',
  p_up: '0',
  p_down: '0',
  stablecoin: '0',
  collateralStablecoinUsd: 0,
}

const LoanInfoLlamma = ({ llamma, llammaId, rChainId }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })

  const { bandsBalances, priceInfo } = loanDetails ?? {}
  const { oraclePrice, oraclePriceBand } = priceInfo ?? {}

  const chartBandBalancesData = useMemo(() => {
    let data = cloneDeep(bandsBalances ?? [])

    if (data?.length > 0 && typeof oraclePriceBand === 'number') {
      const firstN = data[0].n
      const lastN = data[data.length - 1].n
      if (oraclePriceBand > +firstN) {
        if (+firstN + 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          data.unshift({ ...DEFAULT_BAND_CHART_DATA, n: `${+firstN + 1}...${oraclePriceBand - 1}`, isNGrouped: true })
        }
        data.unshift({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      } else if (oraclePriceBand < +lastN) {
        if (+lastN - 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          data.push({ ...DEFAULT_BAND_CHART_DATA, n: `${+lastN - 1}...${oraclePriceBand + 1}`, isNGrouped: true })
        }
        data.push({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      }
    }
    return data
  }, [bandsBalances, oraclePriceBand])

  const chartBandBalancesDataLength = chartBandBalancesData.length

  const parsedChartBandBalancesData = useMemo(() => {
    setBrushIndex({ startIndex: undefined, endIndex: undefined })
    return parseData(chartBandBalancesData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartBandBalancesDataLength])

  return (
    <Wrapper>
      {!chartExpanded && (
        <div className="wrapper">
          <PoolInfoData rChainId={rChainId} llamma={llamma} llammaId={llammaId} />
        </div>
      )}

      <div className="wrapper">
        <ChartBandBalances
          llamma={llamma}
          brushIndex={brushIndex}
          data={parsedChartBandBalancesData}
          oraclePrice={oraclePrice}
          oraclePriceBand={oraclePriceBand}
          showLiquidationIndicator={false}
          title={t`Bands`}
          setBrushIndex={setBrushIndex}
        />
      </div>

      <InfoWrapper className="wrapper last">
        <ContractsWrapper>
          <SubTitle>{t`Contracts`}</SubTitle>
          <DetailInfoAddressLookup isBorderBottom chainId={rChainId} title={t`AMM`} address={llamma?.address ?? ''} />
          <DetailInfoAddressLookup
            isBorderBottom
            chainId={rChainId}
            title={t`Controller`}
            address={llamma?.controller ?? ''}
          />
          <DetailInfoAddressLookup
            chainId={rChainId}
            title={t`Monetary Policy`}
            address={llamma?.monetaryPolicy ?? ''}
          />
        </ContractsWrapper>

        <ParametersWrapper>
          <SubTitle>{t`Loan parameters`}</SubTitle>
          <LoanInfoParameters llamma={llamma} llammaId={llammaId} />
        </ParametersWrapper>
      </InfoWrapper>
    </Wrapper>
  )
}

LoanInfoLlamma.defaultProps = {
  className: '',
}

const Wrapper = styled.div`
  .wrapper {
    border-bottom: 1px solid var(--border-600);
    padding: 1.5em 0.75rem 1.5rem 0.75rem;

    @media (min-width: ${breakpoints.sm}rem) {
      padding: 2rem;
    }
  }
`

const InfoWrapper = styled.div`
  &.wrapper {
    border-bottom: none;
    padding: 0;

    @media (min-width: ${breakpoints.sm}rem) {
      display: grid;
      grid-auto-flow: column;
    }
  }
`

const ContractsWrapper = styled.div`
  padding: 2rem 1rem 1rem 1rem;
`

const ParametersWrapper = styled.div`
  background-color: var(--box--secondary--content--background-color);
  padding: 2rem 1rem;
`

export default LoanInfoLlamma

function findDataIndex(d: BandsBalancesData) {
  return (
    +d.collateral !== 0 ||
    +d.collateralUsd !== 0 ||
    d.isLiquidationBand ||
    d.isOraclePriceBand ||
    +d.stablecoin ||
    d.isNGrouped
  )
}

// show +-50 active data if it is not user Chart
function parseData(data: BandsBalancesData[]) {
  const firstDataIdx = data.findIndex(findDataIndex)
  const lastDataIdx = data.findLastIndex(findDataIndex)
  return data.slice(firstDataIdx, lastDataIdx + 1)
}
