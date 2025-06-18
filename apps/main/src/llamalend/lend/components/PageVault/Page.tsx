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
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { Api, type MarketUrlParams, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import { parseMarketParams } from '@/lend/utils/utilsRouter'
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
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const Page = (params: MarketUrlParams) => {
  const { rMarket, rChainId, rFormType } = parseMarketParams(params)
  const { connect, provider } = useWallet()
  const { llamaApi: api = null, connectState } = useConnection()
  const titleMapper = useTitleMapper()
  const market = useOneWayMarket(rChainId, rMarket).data

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const marketDetailsView = useStore((state) => state.markets.marketDetailsView)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const rOwmId = market?.id ?? ''
  const { signerAddress } = api ?? {}
  const [isLoaded, setLoaded] = useState(false)

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
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchAllMarketDetails, fetchAllUserMarketDetails, fetchUserLoanExists, fetchUserMarketBalances],
  )

  useEffect(() => {
    if (api && market && isPageVisible) void fetchInitial(api, market)
  }, [api, fetchInitial, isPageVisible, market])

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
            connectWallet={() => connect()}
            isLoading={isLoading(connectState)}
          />
        </Box>
      )}
    </>
  )
}

export default Page
