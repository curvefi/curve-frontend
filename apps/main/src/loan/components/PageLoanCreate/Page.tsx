'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import LoanInfoLlamma from '@/loan/components/LoanInfoLlamma'
import LoanCreate from '@/loan/components/PageLoanCreate/index'
import { hasLeverage } from '@/loan/components/PageLoanCreate/utils'
import { usePageOnMount } from '@/loan/hooks/usePageOnMount'
import useTitleMapper from '@/loan/hooks/useTitleMapper'
import useStore from '@/loan/store/useStore'
import { useLendConnection } from '@/loan/temp-lib'
import { type CollateralUrlParams, type Curve, Llamma } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { getCollateralListPathname, getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentHeader,
  AppPageInfoContentWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Icon from '@ui/Icon'
import TextEllipsis from '@ui/TextEllipsis'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const Page = (params: CollateralUrlParams) => {
  const { push } = useRouter()
  const { routerParams, curve, pageLoaded } = usePageOnMount()
  const titleMapper = useTitleMapper()
  const { rChainId, rCollateralId, rFormType } = routerParams
  const { connectState } = useLendConnection()
  const { connect: connectWallet, provider } = useWallet()
  const [loaded, setLoaded] = useState(false)

  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[rCollateralId])
  const formValues = useStore((state) => state.loanCreate.formValues)
  const loanExists = useStore((state) => state.loans.existsMapper[rCollateralId]?.loanExists)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const navHeight = useStore((state) => state.layout.navHeight)
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanWalletBalances = useStore((state) => state.loans.fetchUserLoanWalletBalances)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const setStateByKeys = useStore((state) => state.loanCreate.setStateByKeys)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

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
      void setFormValues(curve, isLeverage, llamma, updatedFormValues, maxSlippage)

      if (curve.signerAddress) {
        void fetchUserLoanWalletBalances(curve, llamma)
      }
    },
    [fetchUserLoanWalletBalances, formValues, maxSlippage, setFormValues, setStateByKeys],
  )

  useEffect(() => {
    if (!pageLoaded) {
      setLoaded(false)
    } else if (curve) {
      if (!llamma) {
        push(getCollateralListPathname(params))
      } else {
        resetUserDetailsState(llamma)
        fetchInitial(curve, isLeverage, llamma)
        void fetchLoanDetails(curve, llamma)
        setLoaded(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded])

  // redirect if loan exists
  useEffect(() => {
    if (!loaded && llamma && loanExists) {
      push(getLoanManagePathname(params, llamma.id, 'loan'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, loanExists])

  //  redirect if form is leverage but no leverage option
  useEffect(() => {
    if (llamma && rFormType === 'leverage' && !hasLeverage(llamma)) {
      push(getLoanCreatePathname(params, llamma.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, rFormType, llamma])

  // max slippage updated
  useEffect(() => {
    if (loaded && !!curve) {
      void setFormValues(curve, isLeverage, llamma, formValues, maxSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve && llamma) {
        void fetchLoanDetails(curve, llamma)
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
    isReady,
    llamma,
    llammaId,
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
          {!isMdUp && !chartExpanded && <TitleComp />}
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
        </AppPageFormsWrapper>

        <AppPageInfoWrapper>
          {isMdUp && !chartExpanded && <TitleComp />}
          <AppPageInfoContentWrapper variant="secondary">
            <AppPageInfoContentHeader>LLAMMA Details</AppPageInfoContentHeader>
            {isValidRouterParams && rChainId && (
              <LoanInfoLlamma {...formProps} rChainId={rChainId} titleMapper={titleMapper} />
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

const Wrapper = styled(AppPageFormContainer)<{ isAdvanceMode: boolean; chartExpanded: boolean }>`
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
