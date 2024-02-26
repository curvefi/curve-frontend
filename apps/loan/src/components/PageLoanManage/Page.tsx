import type { NextPage } from 'next'
import type { DetailInfoTypes, FormType } from '@/components/PageLoanManage/types'

import { t } from '@lingui/macro'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { REFRESH_INTERVAL } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { getCollateralListPathname, getLoanCreatePathname } from '@/utils/utilsRouter'
import { getTokenName } from '@/utils/utilsLoan'
import { hasDeleverage } from '@/components/PageLoanManage/utils'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import PoolInfoData from '@/components/PoolInfoData'
import DocumentHead from '@/layout/DocumentHead'
import LoanInfoLlamma from '@/components/LoanInfoLlamma'
import LoanInfoUser from '@/components/LoanInfoUser'
import LoanMange from '@/components/PageLoanManage/index'
import Tabs, { Tab, TabContentWrapper } from '@/ui/Tab'
import TextEllipsis from '@/ui/TextEllipsis'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { curve, routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId, rCollateralId, rFormType } = routerParams

  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[rCollateralId])
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const navHeight = useStore((state) => state.layout.navHeight)
  const loanExists = useStore((state) => state.loans.existsMapper[rCollateralId])
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanDetails = useStore((state) => state.loans.fetchUserLoanDetails)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)

  const [selectedTab, setSelectedTab] = useState<DetailInfoTypes>('user')
  const [loaded, setLoaded] = useState(false)

  const llamma = collateralData?.llamma
  const llammaId = llamma?.id || ''
  const isValidRouterParams = !!rChainId && !!rCollateralId && !!rFormType
  const isReady = !!curve?.signerAddress && !!llamma

  const DETAIL_INFO_TYPES: { key: DetailInfoTypes; label: string }[] = useMemo(() => {
    return isAdvanceMode
      ? [
          { label: t`Your Loan Details`, key: 'user' },
          { label: t`LLAMMA Details`, key: 'llamma' },
        ]
      : [{ label: t`Your Loan Details`, key: 'user' }]
  }, [isAdvanceMode])

  // onMount
  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    if (curve && !isLoadingApi) {
      if (!rChainId || !rCollateralId || !rFormType) {
        navigate(getCollateralListPathname(params))
      } else if (curve.signerAddress && llamma) {
        ;(async () => {
          const fetchedLoanDetails = await fetchLoanDetails(curve, llamma)
          if (!fetchedLoanDetails.loanExists.loanExists) {
            resetUserDetailsState(llamma)
            navigate(getLoanCreatePathname(params, rCollateralId))
          }
          setLoaded(true)
        })()
      } else {
        navigate(getCollateralListPathname(params))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isLoadingApi, rFormType])

  useEffect(() => {
    if (!loaded && loanExists && !loanExists.loanExists) {
      resetUserDetailsState(llamma)
      navigate(getLoanCreatePathname(params, rCollateralId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, loanExists])

  //  redirect if form is deleverage but no deleverage option
  useEffect(() => {
    if (llamma && rFormType === 'deleverage' && !hasDeleverage(llamma)) {
      navigate(getLoanCreatePathname(params, llamma.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, rFormType, llamma])

  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve && !!curve.signerAddress && llamma && loanExists) {
        fetchLoanDetails(curve, llamma)
        fetchUserLoanDetails(curve, llamma)
      }
    },
    REFRESH_INTERVAL['1m'],
    isPageVisible
  )

  const TitleComp = () => (
    <TitleWrapper>
      <Title>{collateralData?.displayName || getTokenName(llamma).collateral}</Title>
    </TitleWrapper>
  )

  const formProps = {
    curve,
    isReady: !!curve?.signerAddress && !!llamma,
    llamma,
    llammaId,
    rChainId,
  }

  return (
    <>
      <DocumentHead title={t`${llamma?.collateralSymbol}` ?? t`Manage`} />
      {chartExpanded && (
        <PriceAndTradesExpandedContainer>
          <Box flex>
            {isMdUp && <TitleComp />}
            <ExpandButton
              variant={'select'}
              onClick={() => {
                setChartExpanded()
              }}
            >
              {chartExpanded ? 'Minimize' : 'Expand'}
              <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
            </ExpandButton>
          </Box>
          <PriceAndTradesExpandedWrapper variant="secondary">
            <PoolInfoData rChainId={rChainId} llamma={llamma} llammaId={llammaId} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}
      <Wrapper chartExpanded={chartExpanded}>
        <FormWrapper navHeight={navHeight}>
          {(!isMdUp || !isAdvanceMode) && <TitleComp />}
          {isValidRouterParams && (
            <LoanMange
              {...formProps}
              params={params}
              rChainId={rChainId}
              rCollateralId={rCollateralId}
              rFormType={rFormType as FormType}
            />
          )}
        </FormWrapper>

        <LoanInfoWrapper>
          {isMdUp && <TitleComp />}
          <LoanInfoTabsWrapper>
            <Tabs>
              {DETAIL_INFO_TYPES.map(({ key, label }) => (
                <Tab
                  key={key}
                  className={selectedTab === key ? 'active' : ''}
                  variant="secondary"
                  disabled={typeof loanExists === 'undefined'}
                  onClick={() => {
                    if (loanExists) {
                      setSelectedTab(key)
                    } else {
                      resetUserDetailsState(llamma)
                      navigate(getLoanCreatePathname(params, rCollateralId))
                    }
                  }}
                >
                  {label}
                </Tab>
              ))}
            </Tabs>
          </LoanInfoTabsWrapper>
          <LoanInfoContentWrapper variant="secondary">
            {selectedTab === 'user' && isValidRouterParams && <LoanInfoUser {...formProps} rChainId={rChainId} />}
            {selectedTab === 'llamma' && isValidRouterParams && <LoanInfoLlamma {...formProps} rChainId={rChainId} />}
          </LoanInfoContentWrapper>
        </LoanInfoWrapper>
      </Wrapper>
    </>
  )
}

const Wrapper = styled(Box)<{ chartExpanded: boolean }>`
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
    align-items: flex-start;
    display: flex;
    ${({ chartExpanded }) => chartExpanded && `margin-top: 1.5rem;`};
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
const LoanInfoWrapper = styled.div`
  margin-bottom: 2rem;
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    margin-left: 1.5rem;
  }
`

const LoanInfoTabsWrapper = styled.header`
  display: flex;
  justify-content: space-between;

  background-color: var(--box_header--primary--background-color);
  border-bottom: var(--box_header--border);
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
