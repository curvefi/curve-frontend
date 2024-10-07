import { breakpoints } from '@/ui/utils/responsive'
import { t } from '@lingui/macro'

import React from 'react'
import styled from 'styled-components'


import PoolInfoData from '@/components/ChartOhlcWrapper'
import DetailInfoAddressLookup from '@/components/LoanInfoLlamma/components/DetailInfoAddressLookup'
import DetailsBandsChart from '@/components/LoanInfoLlamma/components/DetailsBandsChart'
import DetailsInfo from '@/components/LoanInfoLlamma/components/DetailsInfo'
import LoanInfoParameters from '@/components/LoanInfoLlamma/LoanInfoParameters'
import { SubTitle } from '@/components/LoanInfoLlamma/styles'
import type { PageLoanManageProps } from '@/components/PageLoanManage/types'
import useStore from '@/store/useStore'

interface Props extends Pick<PageLoanManageProps, 'llamma' | 'llammaId' | 'rChainId' | 'titleMapper'> {
  className?: string
}

const LoanInfoLlamma = (props: Props) => {
  const { rChainId, llamma, llammaId } = props
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  return (
    <Wrapper>
      <div className="wrapper">
        <DetailsInfo {...props} collateralId={llammaId} />
      </div>

      {!chartExpanded && (
        <div className={isAdvanceMode ? 'wrapper' : ''}>
          <PoolInfoData {...props} />
        </div>
      )}

      {isAdvanceMode && (
        <>
          <div className="wrapper">
            <DetailsBandsChart llammaId={llammaId} llamma={llamma} />
          </div>

          <InfoWrapper className="wrapper last">
            <ContractsWrapper>
              <SubTitle>{t`Contracts`}</SubTitle>
              <DetailInfoAddressLookup
                isBorderBottom
                chainId={rChainId}
                title={t`AMM`}
                address={llamma?.address ?? ''}
              />
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
        </>
      )}
    </Wrapper>
  )
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
