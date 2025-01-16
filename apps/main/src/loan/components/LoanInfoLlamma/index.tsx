import type { PageLoanManageProps } from '@/loan/components/PageLoanManage/types'

import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'
import useStore from '@/loan/store/useStore'

import { SubTitle } from '@/loan/components/LoanInfoLlamma/styles'
import DetailsBandsChart from '@/loan/components/LoanInfoLlamma/components/DetailsBandsChart'
import DetailsInfo from '@/loan/components/LoanInfoLlamma/components/DetailsInfo'
import DetailInfoAddressLookup from '@/loan/components/LoanInfoLlamma/components/DetailInfoAddressLookup'
import LoanInfoParameters from '@/loan/components/LoanInfoLlamma/LoanInfoParameters'
import PoolInfoData from '@/loan/components/ChartOhlcWrapper'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

interface Props extends Pick<PageLoanManageProps, 'llamma' | 'llammaId' | 'rChainId' | 'titleMapper'> {
  className?: string
}

const LoanInfoLlamma = (props: Props) => {
  const { rChainId, llamma, llammaId } = props
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  return (
    <Wrapper>
      <div className="wrapper">
        <DetailsInfo {...props} collateralId={llammaId} />
      </div>

      {!chartExpanded && (
        <div className={isAdvancedMode ? 'wrapper' : ''}>
          <PoolInfoData {...props} />
        </div>
      )}

      {isAdvancedMode && (
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
