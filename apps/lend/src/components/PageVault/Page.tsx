import type { NextPage } from 'next'
import type { DetailInfoTypes } from '@/components/PageLoanManage/types'

import React, { useCallback, useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { REFRESH_INTERVAL } from '@/constants'
import { _getSelectedTab } from '@/components/PageLoanManage/utils'
import { helpers } from '@/lib/apiLending'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'
import useTitleMapper from '@/hooks/useTitleMapper'

import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@/ui/AppPage'
import DocumentHead from '@/layout/DocumentHead'
import DetailsMarket from 'components/DetailsMarket'
import DetailsUser from 'components/DetailsUser'
import PageTitleBorrowSupplyLinks from '@/components/SharedPageStyles/PageTitleBorrowSupplyLinks'
import Tabs, { Tab } from '@/ui/Tab'
import Vault from '@/components/PageVault/index'
import Box from '@/ui/Box'
import CampaignRewardsBanner from '@/components/CampaignRewardsBanner'
import ConnectWallet from '@/components/ConnectWallet'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useOneWayMarket } from '@/entities/chain'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams, api } = usePageOnMount(params, location, navigate)
  const titleMapper = useTitleMapper()
  const { rChainId, rOwmId, rSubdirectory, rFormType } = routerParams

  const market = useOneWayMarket(rChainId, rOwmId).data
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const marketDetailsView = useStore((state) => state.markets.marketDetailsView)
  const fetchAllMarketDetails = useStore((state) => state.markets.fetchAll)
  const fetchAllUserMarketDetails = useStore((state) => state.user.fetchAll)
  const fetchUserLoanExists = useStore((state) => state.user.fetchUserLoanExists)
  const fetchUserMarketBalances = useStore((state) => state.user.fetchUserMarketBalances)
  const setMarketsStateKey = useStore((state) => state.markets.setStateByKey)
  const provider = useStore((state) => state.wallet.getProvider(''))

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { signerAddress } = api ?? {}
  const { borrowed_token } = market ?? {}

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

        fetchAllMarketDetails(api, market, true)

        if (signerAddress) {
          const loanExists = (await fetchUserLoanExists(api, market, true))?.loanExists
          if (loanExists) {
            fetchAllUserMarketDetails(api, market, true)
          } else {
            fetchUserMarketBalances(api, market, true)
          }
        }
        setInitialLoaded(true)
      }, REFRESH_INTERVAL['3s'])
    },
    [fetchAllMarketDetails, fetchAllUserMarketDetails, fetchUserLoanExists, fetchUserMarketBalances],
  )

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    setLoaded(false)

    if (!isLoadingApi && api && market) {
      fetchInitial(api, market)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingApi])

  useEffect(() => {
    if (api && market && isPageVisible && initialLoaded) fetchInitial(api, market)
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
      <DocumentHead title={`${borrowed_token?.symbol ?? ''} | Supply`} />
      {provider ? (
        <AppPageFormContainer isAdvanceMode={isAdvancedMode}>
          <AppPageFormsWrapper navHeight="var(--nav-height)">
            {(!isMdUp || !isAdvancedMode) && <TitleComp />}
            {rChainId && rOwmId && <Vault {...pageProps} />}
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

export default Page
