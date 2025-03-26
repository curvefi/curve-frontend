'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import LoanInfoLlamma from '@/loan/components/LoanInfoLlamma'
import LoanInfoUser from '@/loan/components/LoanInfoUser'
import LoanMange from '@/loan/components/PageLoanManage/index'
import type { DetailInfoTypes, FormType } from '@/loan/components/PageLoanManage/types'
import { hasDeleverage } from '@/loan/components/PageLoanManage/utils'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import useTitleMapper from '@/loan/hooks/useTitleMapper'
import useStore from '@/loan/store/useStore'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { getCollateralListPathname, getLoanCreatePathname } from '@/loan/utils/utilsRouter'
import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Icon from '@ui/Icon'
import Tabs, { Tab } from '@ui/Tab'
import TextEllipsis from '@ui/TextEllipsis'
import { isLoading } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useApiStore } from '@ui-kit/shared/useApiStore'

const Page = (params: CollateralUrlParams) => {
  const { push } = useRouter()
  const { curve, routerParams } = usePageOnMount()
  const titleMapper = useTitleMapper()
  const { rChainId, rCollateralId, rFormType } = routerParams

  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[rCollateralId])
  const isLoadingLlamalend = useApiStore((state) => state.isLoadingLlamalend)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const navHeight = useStore((state) => state.layout.navHeight)
  const loanExists = useStore((state) => state.loans.existsMapper[rCollateralId])
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanDetails = useStore((state) => state.loans.fetchUserLoanDetails)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)
  const { provider } = useWallet()

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

  useEffect(() => {
    if (curve && !isLoadingLlamalend) {
      if (!rChainId || !rCollateralId || !rFormType) {
        push(getCollateralListPathname(params))
      } else if (curve.signerAddress && llamma) {
        ;(async () => {
          const fetchedLoanDetails = await fetchLoanDetails(curve, llamma)
          if (!fetchedLoanDetails.loanExists.loanExists) {
            resetUserDetailsState(llamma)
            push(getLoanCreatePathname(params, rCollateralId))
          }
          setLoaded(true)
        })()
      } else {
        push(getCollateralListPathname(params))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isLoadingLlamalend, rFormType])

  useEffect(() => {
    if (!loaded && loanExists && !loanExists.loanExists) {
      resetUserDetailsState(llamma)
      push(getLoanCreatePathname(params, rCollateralId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, loanExists])

  //  redirect if form is deleverage but no deleverage option
  useEffect(() => {
    if (llamma && rFormType === 'deleverage' && !hasDeleverage(llamma)) {
      push(getLoanCreatePathname(params, llamma.id))
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

  return provider ? (
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
                      push(getLoanCreatePathname(params, rCollateralId))
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
      <ConnectWalletPrompt
        description={t`Connect your wallet to view market`}
        connectText={t`Connect`}
        loadingText={t`Connecting`}
        connectWallet={() => connectWallet()}
        isLoading={isLoading(connectState)}
      />
    </Box>
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
