import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { REFRESH_INTERVAL } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { getCollateralListPathname, getLoanCreatePathname, getLoanManagePathname } from '@/utils/utilsRouter'
import { getTokenName } from '@/utils/utilsLoan'
import { hasLeverage } from '@/components/PageLoanCreate/utils'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import PoolInfoData from '@/components/PoolInfoData'
import { TabContentWrapper } from '@/ui/Tab'
import Box, { BoxHeader } from '@/ui/Box'
import DocumentHead from '@/layout/DocumentHead'
import LoanCreate from '@/components/PageLoanCreate/index'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import LoanInfoLlamma from '@/components/LoanInfoLlamma'
import TextEllipsis from '@/ui/TextEllipsis'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams, curve } = usePageOnMount(params, location, navigate)
  const { rChainId, rCollateralId, rFormType } = routerParams

  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[rCollateralId])
  const formValues = useStore((state) => state.loanCreate.formValues)
  const loanExists = useStore((state) => state.loans.existsMapper[rCollateralId]?.loanExists)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const maxSlippage = useStore((state) => state.maxSlippage)
  const navHeight = useStore((state) => state.layout.navHeight)
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanWalletBalances = useStore((state) => state.loans.fetchUserLoanWalletBalances)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const setStateByKeys = useStore((state) => state.loanCreate.setStateByKeys)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)

  const [loaded, setLoaded] = useState(false)

  const llamma = collateralData?.llamma
  const llammaId = llamma?.id ?? ''
  const isReady = !!llamma
  const isValidRouterParams = !!rChainId && !!rCollateralId
  const isLeverage = rFormType === 'leverage'

  const fetchInitial = useCallback(
    (curve: Curve, isLeverage: boolean, llamma: Llamma) => {
      // reset createLoan estGas, detailInfo state
      setStateByKeys({
        formEstGas: {},
        detailInfo: {},
        detailInfoLeverage: {},
        liqRanges: {},
        liqRangesMapper: {},
        maxRecv: {},
        maxRecvLeverage: {},
      })

      const updatedFormValues = { ...formValues, n: formValues.n || llamma.defaultBands }
      setFormValues(curve, isLeverage, llamma, updatedFormValues, maxSlippage)

      if (curve.signerAddress) {
        fetchUserLoanWalletBalances(curve, llamma)
      }
    },
    [fetchUserLoanWalletBalances, formValues, maxSlippage, setFormValues, setStateByKeys]
  )

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    if (isLoadingApi) {
      setLoaded(false)
    } else if (curve) {
      if (!llamma) {
        navigate(getCollateralListPathname(params))
      } else {
        resetUserDetailsState(llamma)
        fetchInitial(curve, isLeverage, llamma)
        fetchLoanDetails(curve, llamma)
        setLoaded(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingApi])

  // redirect if loan exists
  useEffect(() => {
    if (!loaded && llamma && loanExists) {
      navigate(getLoanManagePathname(params, llamma.id, 'loan'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, loanExists])

  //  redirect if form is leverage but no leverage option
  useEffect(() => {
    if (llamma && rFormType === 'leverage' && !hasLeverage(llamma)) {
      navigate(getLoanCreatePathname(params, llamma.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, rFormType, llamma])

  // max slippage updated
  useEffect(() => {
    if (loaded && !!curve) {
      setFormValues(curve, isLeverage, llamma, formValues, maxSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve && llamma) {
        fetchLoanDetails(curve, llamma)
      }
    },
    REFRESH_INTERVAL['1m'],
    isPageVisible
  )

  useEffect(() => {
    if (!isMdUp && chartExpanded) setChartExpanded()
  }, [chartExpanded, isMdUp, setChartExpanded])

  const TitleComp = () => (
    <TitleWrapper>
      <Title>{collateralData?.displayName || getTokenName(llamma).collateral}</Title>
    </TitleWrapper>
  )

  const formProps = {
    curve,
    isReady,
    llamma,
    llammaId,
  }

  return (
    <>
      <DocumentHead title={t`${rCollateralId}` ?? t`Create`} />
      {chartExpanded && (
        <PriceAndTradesExpandedContainer>
          <Box flex>
            <TitleComp />
            <ExpandButton variant={'select'} onClick={() => setChartExpanded()}>
              {chartExpanded ? 'Minimize' : 'Expand'}
              <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
            </ExpandButton>
          </Box>
          <PriceAndTradesExpandedWrapper variant="secondary">
            <PoolInfoData rChainId={rChainId} llamma={llamma} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}
      <Wrapper isAdvanceMode={isAdvanceMode}>
        <FormWrapper navHeight={navHeight}>
          {(!isMdUp || !isAdvanceMode) && <TitleComp />}
          {rChainId && rCollateralId && (
            <LoanCreate
              curve={curve}
              isReady={isReady}
              isLeverage={isLeverage}
              loanExists={loanExists}
              llamma={llamma}
              llammaId={llammaId}
              params={params}
              rChainId={rChainId}
              rCollateralId={rCollateralId}
              rFormType={rFormType}
              fetchInitial={fetchInitial}
            />
          )}
        </FormWrapper>

        {isAdvanceMode && (
          <LoanInfoWrapper>
            {isMdUp && !chartExpanded && <TitleComp />}
            <LoanInfoContentWrapper variant="secondary">
              <StyledBoxHeader>LLAMMA Details</StyledBoxHeader>
              {isValidRouterParams && rChainId && <LoanInfoLlamma {...formProps} rChainId={rChainId} />}
            </LoanInfoContentWrapper>
          </LoanInfoWrapper>
        )}
      </Wrapper>
    </>
  )
}

const Wrapper = styled(Box)<{ isAdvanceMode: boolean }>`
  margin: 2rem auto 0 auto;

  @media (min-width: 425px) {
    margin-left: 1rem;
    margin-right: 1rem;
  }
  @media (min-width: ${breakpoints.sm}rem) {
    margin-left: 3rem;
    margin-right: 3rem;
  }
  @media (min-width: ${breakpoints.md}rem) {
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 3rem;
    ${({ isAdvanceMode }) => (isAdvanceMode ? `align-items: flex-start;` : `justify-content: center;`)};
    display: flex;
  }
`

const TitleWrapper = styled.header`
  align-items: center;
  display: flex;
  min-height: 46px;
  padding-left: 0.5rem;

  @media (min-width: ${breakpoints.md}rem) {
    padding-left: 0;
  }
`

const Title = styled(TextEllipsis)`
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

// Loan Form
const FormWrapper = styled(Box)<{ navHeight: number }>`
  margin-bottom: 2rem;

  @media (min-width: ${breakpoints.md}rem) {
    align-self: flex-start;
    min-width: var(--loan-form-min-width);
    max-width: var(--loan-form-min-width);
    //position: sticky;
    top: ${({ navHeight }) => `${navHeight + 40}px;`};
  }
`

// Loan Info
const StyledBoxHeader = styled(BoxHeader)`
  padding-left: 1rem;
`

const LoanInfoWrapper = styled.div`
  margin-bottom: 2rem;
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    margin-left: 1.5rem;
  }
`

const LoanInfoContentWrapper = styled(TabContentWrapper)`
  min-height: 14.6875rem; // 235px
  position: relative;
`

const PriceAndTradesExpandedContainer = styled(Box)`
  margin: 1.5rem 0 0;
  display: flex;
  @media (min-width: ${breakpoints.md}rem) {
    flex-direction: column;
  }
`

const PriceAndTradesExpandedWrapper = styled(Box)`
  background-color: var(--tab-secondary--content--background-color);
`

const ExpandButton = styled(Button)`
  margin: auto var(--spacing-3) auto auto;
  display: flex;
  align-content: center;
  color: inherit;
  font-size: var(--font-size-2);
`

const ExpandIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default Page
