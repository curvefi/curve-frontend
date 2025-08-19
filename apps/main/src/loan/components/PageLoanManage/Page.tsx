'use client'
import { useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import LoanInfoLlamma from '@/loan/components/LoanInfoLlamma'
import LoanInfoUser from '@/loan/components/LoanInfoUser'
import { MarketInformationComp } from '@/loan/components/MarketInformationComp'
import LoanMange from '@/loan/components/PageLoanManage/index'
import type { DetailInfoTypes, FormType } from '@/loan/components/PageLoanManage/types'
import { hasDeleverage } from '@/loan/components/PageLoanManage/utils'
import { useLoanPositionDetails } from '@/loan/hooks/useLoanPositionDetails'
import { useMarketDetails } from '@/loan/hooks/useMarketDetails'
import useTitleMapper from '@/loan/hooks/useTitleMapper'
import useStore from '@/loan/store/useStore'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import {
  getCollateralListPathname,
  getLoanCreatePathname,
  parseCollateralParams,
  useChainId,
} from '@/loan/utils/utilsRouter'
import Stack from '@mui/material/Stack'
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
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { MarketDetails } from '@ui-kit/features/market-details'
import { BorrowPositionDetails } from '@ui-kit/features/market-position-details'
import { NoPosition } from '@ui-kit/features/market-position-details/NoPosition'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const Page = (params: CollateralUrlParams) => {
  const { rFormType, rCollateralId } = parseCollateralParams(params)
  const push = useNavigate()
  const { connectState, llamaApi: curve = null } = useConnection()
  const pageLoaded = !isLoading(connectState)
  const titleMapper = useTitleMapper()
  const rChainId = useChainId(params)

  const { llamma, displayName } =
    useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[rCollateralId]) ?? {}
  const llammaId = llamma?.id || ''

  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const loanExists = useStore((state) => state.loans.existsMapper[rCollateralId])
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanDetails = useStore((state) => state.loans.fetchUserLoanDetails)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)
  const { provider, connect: connectWallet } = useWallet()

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [selectedTab, setSelectedTab] = useState<DetailInfoTypes>('user')
  const [loaded, setLoaded] = useState(false)
  const [isBeta] = useBetaFlag()

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

  const marketDetails = useMarketDetails({ chainId: rChainId, llamma, llammaId })
  const positionDetails = useLoanPositionDetails({
    chainId: rChainId,
    llamma,
    llammaId,
  })

  useEffect(() => {
    if (curve && pageLoaded) {
      if (!rChainId || !rCollateralId || !rFormType) {
        push(getCollateralListPathname(params))
      } else if (curve.signerAddress && llamma) {
        void (async () => {
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
  }, [isReady, pageLoaded, rFormType])

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
        void fetchLoanDetails(curve, llamma)
        void fetchUserLoanDetails(curve, llamma)
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
      <Title>{displayName || getTokenName(llamma).collateral}</Title>
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
      {!isBeta ? (
        <Wrapper isAdvanceMode={isAdvancedMode} chartExpanded={chartExpanded}>
          <AppPageFormsWrapper>
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
      ) : (
        <Stack
          sx={(theme) => ({
            marginRight: Spacing.md,
            marginLeft: Spacing.md,
            marginTop: Spacing.xl,
            marginBottom: Spacing.xxl,
            gap: Spacing.xl,
            flexDirection: 'column',
            // 961px, matches old Action card breakpoint
            [theme.breakpoints.up(961)]: {
              flexDirection: 'row', // 1100px
            },
          })}
        >
          <AppPageFormsWrapper>
            {(!isMdUp || !isAdvancedMode) && <TitleComp />}
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
          <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
            {loanExists?.loanExists ? (
              <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
                <BorrowPositionDetails {...positionDetails} />
              </Stack>
            ) : (
              <Stack padding={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
                <NoPosition type="borrow" />
              </Stack>
            )}
            <Stack>
              <MarketDetails {...marketDetails} />
              <MarketInformationComp
                llamma={llamma}
                llammaId={llammaId}
                chainId={rChainId}
                chartExpanded={chartExpanded}
                page="manage"
              />
            </Stack>
          </Stack>
        </Stack>
      )}
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
