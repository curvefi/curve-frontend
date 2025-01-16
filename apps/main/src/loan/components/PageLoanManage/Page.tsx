import type { NextPage } from 'next'
import type { DetailInfoTypes, FormType } from '@/loan/components/PageLoanManage/types'

import { t } from '@lingui/macro'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { REFRESH_INTERVAL } from '@/loan/constants'
import { breakpoints } from '@ui/utils/responsive'
import { getCollateralListPathname, getLoanCreatePathname } from '@/loan/utils/utilsRouter'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { hasDeleverage } from '@/loan/components/PageLoanManage/utils'
import { scrollToTop } from '@/loan/utils/helpers'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import usePageVisibleInterval from '@/loan/hooks/usePageVisibleInterval'
import useStore from '@/loan/store/useStore'
import useTitleMapper from '@/loan/hooks/useTitleMapper'

import {
  AppPageFormContainer,
  AppPageFormTitleWrapper,
  AppPageFormsWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import DocumentHead from '@/loan/layout/DocumentHead'
import LoanInfoLlamma from '@/loan/components/LoanInfoLlamma'
import LoanInfoUser from '@/loan/components/LoanInfoUser'
import LoanMange from '@/loan/components/PageLoanManage/index'
import Tabs, { Tab } from '@ui/Tab'
import TextEllipsis from '@ui/TextEllipsis'
import Button from '@ui/Button'
import Icon from '@ui/Icon'
import ConnectWallet from '@/loan/components/ConnectWallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { curve, routerParams } = usePageOnMount(params, location, navigate)
  const titleMapper = useTitleMapper()
  const { rChainId, rCollateralId, rFormType } = routerParams

  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[rCollateralId])
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const navHeight = useStore((state) => state.layout.navHeight)
  const loanExists = useStore((state) => state.loans.existsMapper[rCollateralId])
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanDetails = useStore((state) => state.loans.fetchUserLoanDetails)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const provider = useStore((state) => state.wallet.getProvider(''))

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [selectedTab, setSelectedTab] = useState<DetailInfoTypes>('user')
  const [loaded, setLoaded] = useState(false)

  const llamma = collateralData?.llamma
  const llammaId = llamma?.id || ''
  const isValidRouterParams = !!rChainId && !!rCollateralId && !!rFormType
  const isReady = !!curve?.signerAddress && !!llamma

  const DETAIL_INFO_TYPES: { key: DetailInfoTypes; label: string }[] = useMemo(
    () =>
      isAdvancedMode
        ? [
            { label: t`LLAMMA Details`, key: 'llamma' },
            { label: t`Your Loan Details`, key: 'user' },
          ]
        : [{ label: t`Your Loan Details`, key: 'user' }],
    [isAdvancedMode],
  )

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
    isPageVisible,
  )

  useEffect(() => {
    if (!isMdUp && chartExpanded) {
      setChartExpanded(false)
    }
  }, [chartExpanded, isMdUp, setChartExpanded])

  const TitleComp = () => (
    <AppPageFormTitleWrapper>
      <Title>{collateralData?.displayName || getTokenName(llamma).collateral}</Title>
    </AppPageFormTitleWrapper>
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
      <DocumentHead title={llamma?.collateralSymbol ? t`${llamma?.collateralSymbol}` : t`Manage`} />
      {provider ? (
        <>
          {chartExpanded && (
            <PriceAndTradesExpandedContainer>
              <Box flex padding="0 0 0 var(--spacing-2)">
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
                <ChartOhlcWrapper rChainId={rChainId} llamma={llamma} llammaId={llammaId} />
              </PriceAndTradesExpandedWrapper>
            </PriceAndTradesExpandedContainer>
          )}
          <Wrapper isAdvanceMode={isAdvancedMode} chartExpanded={chartExpanded}>
            <AppPageFormsWrapper navHeight={navHeight}>
              {(!isMdUp || !isAdvancedMode) && !chartExpanded && <TitleComp />}
              {isValidRouterParams && (
                <LoanMange
                  {...formProps}
                  params={params}
                  rChainId={rChainId}
                  rCollateralId={rCollateralId}
                  rFormType={rFormType as FormType}
                  titleMapper={titleMapper}
                />
              )}
            </AppPageFormsWrapper>

            <AppPageInfoWrapper>
              {isMdUp && !chartExpanded && <TitleComp />}
              <AppPageInfoTabsWrapper>
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
              </AppPageInfoTabsWrapper>
              <AppPageInfoContentWrapper variant="secondary">
                {selectedTab === 'llamma' && isValidRouterParams && (
                  <LoanInfoLlamma {...formProps} rChainId={rChainId} titleMapper={titleMapper} />
                )}
                {selectedTab === 'user' && isValidRouterParams && (
                  <LoanInfoUser {...formProps} rChainId={rChainId} titleMapper={titleMapper} />
                )}
              </AppPageInfoContentWrapper>
            </AppPageInfoWrapper>
          </Wrapper>
        </>
      ) : (
        <Box display="flex" fillWidth flexJustifyContent="center" margin="var(--spacing-3) 0">
          <ConnectWallet
            description={t`Connect your wallet to view market`}
            connectText={t`Connect`}
            loadingText={t`Connecting`}
          />
        </Box>
      )}
    </>
  )
}

const Wrapper = styled(AppPageFormContainer)<{ chartExpanded: boolean }>`
  @media (min-width: ${breakpoints.md}rem) {
    ${({ chartExpanded }) => chartExpanded && `margin-top: 1.5rem;`};
  }
`

const Title = styled(TextEllipsis)`
  color: var(--page--text-color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
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
