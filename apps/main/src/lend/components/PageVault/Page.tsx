'use client'
import { useCallback, useEffect, useState } from 'react'
import CampaignRewardsBanner from '@/lend/components/CampaignRewardsBanner'
import DetailsMarket from '@/lend/components/DetailsMarket'
import DetailsUser from '@/lend/components/DetailsUser'
import type { DetailInfoTypes } from '@/lend/components/PageLoanManage/types'
import { _getSelectedTab } from '@/lend/components/PageLoanManage/utils'
import Vault from '@/lend/components/PageVault/index'
import PageTitleBorrowSupplyLinks from '@/lend/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import { useOneWayMarket } from '@/lend/entities/chain'
import usePageOnMount from '@/lend/hooks/usePageOnMount'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { Api, type MarketUrlParams, PageContentProps } from '@/lend/types/lend.types'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import Tabs, { Tab } from '@ui/Tab'
import { isLoading } from '@ui/utils'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useApiStore } from '@ui-kit/shared/useApiStore'

const Page = (params: MarketUrlParams) => {
  const { routerParams, api } = usePageOnMount()
  const titleMapper = useTitleMapper()
  const { rChainId, rMarket, rSubdirectory, rFormType } = routerParams
  const market = useOneWayMarket(rChainId, rMarket).data
  const rOwmId = market?.id ?? ''
  const isLoadingApi = useApiStore((state) => state.isLoadingLending)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const marketDetailsView = useStore((state) => state.markets.marketDetailsView)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)
  const { provider } = useWallet()

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { signerAddress } = api ?? {}
  const [isLoaded, setLoaded] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  // set tabs
  const DETAIL_INFO_TYPES: { key: DetailInfoTypes; label: string }[] = [{ label: t`Lend Details`, key: 'market' }]
  if (signerAddress) {
    DETAIL_INFO_TYPES.push({ label: t`Your Details`, key: 'user' })
  }
  const selectedTab = _getSelectedTab(marketDetailsView, signerAddress)

  const fetchInitial = useCallback(
    async (api: Api, market: OneWayMarketTemplate) => {
      setLoaded(true)

      // delay fetch rest after form details are fetch first
      setTimeout(async () => {
        const { signerAddress } = api

        void fetchAllMarketDetails(api, market, true)

        if (signerAddress) {
          const loanExists = (await fetchUserLoanExists(api, market, true))?.loanExists
          if (loanExists) {
            void fetchAllUserMarketDetails(api, market, true)
          } else {
            void fetchUserMarketBalances(api, market, true)
          }
        }
        setInitialLoaded(true)
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchAllMarketDetails, fetchAllUserMarketDetails, fetchUserLoanExists, fetchUserMarketBalances],
  )

  useEffect(() => {
    setLoaded(false)

    if (!isLoadingApi && api && market) {
      void fetchInitial(api, market)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingApi])

  useEffect(() => {
    if (api && market && isPageVisible && initialLoaded) void fetchInitial(api, market)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  const TitleComp = () =>
    market && (
      <AppPageFormTitleWrapper>
        <PageTitleBorrowSupplyLinks params={params} activeKey="supply" market={market} />
      </AppPageFormTitleWrapper>
    )

  const pageProps: PageContentProps = {
    params,
    rChainId,
    rOwmId,
    rFormType,
    rSubdirectory,
    isLoaded,
    api,
    market,
    userActiveKey: helpers.getUserActiveKey(api, market!),
    titleMapper,
  }

  return (
    <>
      {provider ? (
        <AppPageFormContainer isAdvanceMode={isAdvancedMode}>
          <AppPageFormsWrapper navHeight="var(--nav-height)">
            {(!isMdUp || !isAdvancedMode) && <TitleComp />}
            {rChainId && rOwmId && <Vault {...pageProps} params={params} />}
          </AppPageFormsWrapper>

          {isAdvancedMode && rChainId && rOwmId && (
            <AppPageInfoWrapper>
              {isMdUp && <TitleComp />}
              <Box margin="0 0 var(--spacing-2)">
                <CampaignRewardsBanner
                  borrowAddress={market?.addresses?.controller || ''}
                  supplyAddress={market?.addresses?.vault || ''}
                />
              </Box>
              <AppPageInfoTabsWrapper>
                <Tabs>
                  {DETAIL_INFO_TYPES.map(({ key, label }) => (
                    <Tab
                      key={key}
                      className={selectedTab === key ? 'active' : ''}
                      variant="secondary"
                      disabled={selectedTab === key}
                      onClick={() => setMarketsStateKey('marketDetailsView', key)}
                    >
                      {label}
                    </Tab>
                  ))}
                </Tabs>
              </AppPageInfoTabsWrapper>

              <AppPageInfoContentWrapper variant="secondary">
                {selectedTab === 'market' && provider && <DetailsMarket {...pageProps} type="supply" />}
                {selectedTab === 'user' && provider && <DetailsUser {...pageProps} type="supply" />}
              </AppPageInfoContentWrapper>
            </AppPageInfoWrapper>
          )}
        </AppPageFormContainer>
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
      )}
    </>
  )
}

export default Page
