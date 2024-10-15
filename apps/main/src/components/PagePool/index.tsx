import type { FormType } from '@/components/PagePool/contextPool'
import type { DetailInfoTypes, PageTransferProps, PoolInfoTab, TransferFormType } from '@/components/PagePool/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import { PoolContext } from '@/components/PagePool/contextPool'
import usePoolAlert from '@/hooks/usePoolAlert'
import networks from '@/networks'
import useStore from '@/store/useStore'
import { breakpoints } from '@/ui/utils/responsive'
import { getChainPoolIdActiveKey } from '@/utils'
import { getPath } from '@/utils/utilsRouter'
import { useNavigate } from 'react-router-dom'
import { usePoolTokenList } from '@/entities/pool'
import { useSignerPoolBalances } from '@/entities/signer'

import Deposit from '@/components/PagePool/Deposit'
import PoolStats from '@/components/PagePool/PoolDetails/PoolStats'
import Swap from '@/components/PagePool/Swap'
import MySharesStats from '@/components/PagePool/UserDetails'
import Withdraw from '@/components/PagePool/Withdraw'
import AlertBox from '@/ui/AlertBox'
import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@/ui/AppForm'
import {
  AppPageFormContainer,
  AppPageFormTitleWrapper,
  AppPageFormsWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@/ui/AppPage'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'
import Tabs, { Tab } from '@/ui/Tab'
import TextEllipsis from '@/ui/TextEllipsis'
import { Chip } from '@/ui/Typography'

import CampaignRewardsBanner from '@/components/PagePool/components/CampaignRewardsBanner'
import PoolInfoData from '@/components/PagePool/PoolDetails/ChartOhlcWrapper'
import PoolParameters from '@/components/PagePool/PoolDetails/PoolParameters'
import { useGaugeManager } from '@/entities/gauge'
import { BlockSkeleton } from '@/shared/ui/skeleton'
import { ManageGauge } from '@/widgets/manage-gauge'
import { isAddressEqual, type Address } from 'viem'

const Transfer: React.FC<PageTransferProps> = (pageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rFormType, rPoolId } = routerParams
  const { signerAddress } = curve ?? {}
  const navigate = useNavigate()
  const poolAlert = usePoolAlert(poolData?.pool.address, poolData?.hasVyperVulnerability)

  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, rPoolId)
  const globalMaxSlippage = useStore((state) => state.maxSlippage[chainIdPoolId])
  const isMdUp = useStore((state) => state.isMdUp)
  const isWrapped = useStore((state) => state.showWrapped[rPoolId]) ?? false
  const layoutHeight = useStore((state) => state.layoutHeight)
  const themeType = useStore((state) => state.themeType)
  const chartExpanded = useStore((state) => state.pools.pricesApiState.chartExpanded)
  const setChartExpanded = useStore((state) => state.pools.setChartExpanded)
  const pricesApiPoolsMapper = useStore((state) => state.pools.pricesApiPoolsMapper)
  const fetchPricesPoolSnapshots = useStore((state) => state.pools.fetchPricesPoolSnapshots)
  const snapshotsMapper = useStore((state) => state.pools.snapshotsMapper)
  const poolTvl = useStore((state) => state.pools.tvlMapper[rChainId]?.[rPoolId]?.value)
  const basePoolsLoading = useStore((state) => state.pools.basePoolsLoading)
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)

  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager({
    chainId: rChainId,
    poolId: poolData?.pool.id!,
  })

  const [selectedTab, setSelectedTab] = useState<DetailInfoTypes>('pool')
  const [formType, setFormType] = useState<FormType>('DEPOSIT')
  const [isSeed, setIsSeed] = useState<boolean | null>(null)

  const { imageBaseUrl = '' } = networks[rChainId] ?? {}
  const { chainId } = curve || {}
  const { pool, hasWrapped } = poolDataCacheOrApi
  const { id: poolId, address: poolAddress } = poolData?.pool ?? {}

  const { scanTxPath } = networks[rChainId]
  const pricesApi = networks[rChainId].pricesApi
  const pricesApiPoolData = poolData && pricesApiPoolsMapper[poolData.pool.address]

  const { poolBaseKeys, poolBaseSignerKeys } = useMemo(() => {
    return {
      poolBaseKeys: { chainId, poolId },
      poolBaseSignerKeys: { chainId, signerAddress, poolId },
    }
  }, [chainId, poolId, signerAddress])

  const { data: { tokens = [], tokensMapper = {} } = {} } = usePoolTokenList({ ...poolBaseKeys, isWrapped })

  const { data: signerPoolBalances, ...signerPoolBalancesState } = useSignerPoolBalances({
    ...poolBaseSignerKeys,
    formType,
  })

  const poolInfoTabs = useMemo<PoolInfoTab[]>(() => {
    const tabs: PoolInfoTab[] = [{ label: t`Pool Details`, key: 'pool' }]

    if (!!signerAddress) {
      tabs.push({ label: t`Your Details`, key: 'user' })
    }
    if (pricesApi && pricesApiPoolData && snapshotsMapper[poolData?.pool.address]) {
      tabs.push({ label: t`Advanced`, key: 'advanced' })
    }

    return tabs
  }, [signerAddress, pricesApi, pricesApiPoolData, snapshotsMapper, poolData?.pool.address])

  const maxSlippage = useMemo(() => {
    if (globalMaxSlippage) return globalMaxSlippage
    if (!pool) return ''

    return pool.isCrypto ? '0.1' : '0.03'
  }, [globalMaxSlippage, pool])

  const navHeight = useMemo(() => {
    return layoutHeight.mainNav + layoutHeight.secondaryNav
  }, [layoutHeight])

  useEffect(() => {
    if (
      curve &&
      poolAddress &&
      pricesApi &&
      pricesApiPoolsMapper[poolAddress] !== undefined &&
      !snapshotsMapper[poolAddress]
    ) {
      fetchPricesPoolSnapshots(rChainId, poolAddress)
    }
  }, [curve, fetchPricesPoolSnapshots, poolAddress, pricesApi, pricesApiPoolsMapper, rChainId, snapshotsMapper])

  const isAvailableManageGauge = useMemo(
    () =>
      !isPendingGaugeManager &&
      !!signerAddress &&
      !!gaugeManager &&
      isAddressEqual(gaugeManager, signerAddress as Address),
    [isPendingGaugeManager, signerAddress, gaugeManager]
  )

  const ACTION_TABS = useMemo<{ key: TransferFormType; label: string }[]>(
    () => [
      { key: 'deposit', label: t`Deposit` },
      { key: 'withdraw', label: themeType === 'chad' ? t`Withdraw Claim` : t`Withdraw/Claim` },
      { key: 'swap', label: t`Swap` },
    ],
    [themeType]
  )

  const toggleForm = useCallback(
    (updatedFormType: TransferFormType) => {
      const pathname = getPath(params, `${ROUTE.PAGE_POOLS}/${params.pool}/${updatedFormType}`)
      navigate(pathname)
    },
    [navigate, params]
  )

  const setPoolIsWrapped = useCallback(
    (poolId: string, isWrapped: boolean) => {
      updateGlobalStoreByKey('showWrapped', { [poolId]: isWrapped })
    },
    [updateGlobalStoreByKey]
  )

  // is seed
  useEffect(() => {
    if (!poolId || typeof poolTvl === 'undefined') return

    const isSeed = Number(poolTvl) === 0
    if (isSeed) updateGlobalStoreByKey('showWrapped', { [poolId]: isSeed && hasWrapped })
    setIsSeed(isSeed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWrapped, poolId, poolTvl])

  useEffect(() => {
    if (!isAvailableManageGauge && rFormType === 'manage-gauge') {
      toggleForm('deposit')
    }
  }, [isAvailableManageGauge, rFormType, toggleForm])

  const TitleComp = () => {
    const referenceAsset: { [referenceAsset: string]: string } = {
      CRYPTO: t`CRYPTO V2`,
      OTHER: t`OTHER`,
    }
    return (
      <AppPageFormTitleWrapper>
        <StyledExternalLink href={networks[rChainId].scanAddressPath(pool.address)}>
          <Title as="h1">{pool?.name || ''}</Title>
        </StyledExternalLink>
        {pool?.referenceAsset && <StyledChip>{referenceAsset[pool.referenceAsset] ?? pool.referenceAsset}</StyledChip>}
      </AppPageFormTitleWrapper>
    )
  }

  // init rewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  useEffect(() => {
    if (!isMdUp && chartExpanded) setChartExpanded(false)
  }, [chartExpanded, isMdUp, setChartExpanded])

  return (
    <PoolContext.Provider
      value={{
        rChainId,
        rPoolId,
        curve,
        chainId,
        signerAddress,
        formType,
        hasWrapped,
        isWrapped,
        imageBaseUrl,
        poolDataCacheOrApi,
        poolData,
        pool: poolData?.pool,
        poolId: poolData?.pool?.id,
        poolAlert,
        poolBaseKeys,
        poolBaseSignerKeys,
        poolTvl,
        maxSlippage,
        isSeed,
        signerPoolBalances,
        signerPoolBalancesIsLoading: signerPoolBalancesState.isFetching,
        signerPoolBalancesIsError: signerPoolBalancesState.isError,
        tokens,
        tokensMapper,
        setPoolIsWrapped,
        setFormType,
        scanTxPath,
      }}
    >
      {pricesApiPoolData && pricesApi && chartExpanded && (
        <PriceAndTradesExpandedContainer>
          <Box flex>
            <TitleComp />
            <ExpandButton variant={'select'} onClick={() => setChartExpanded(!chartExpanded)}>
              {chartExpanded ? 'Minimize' : 'Expand'}
              <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
            </ExpandButton>
          </Box>
          <PriceAndTradesExpandedWrapper variant="secondary">
            <PoolInfoData rChainId={rChainId} pricesApiPoolData={pricesApiPoolData} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}

      <Wrapper isAdvanceMode chartExpanded={chartExpanded}>
        <AppPageFormsWrapper navHeight={navHeight} className="grid-transfer">
          {!isMdUp && <TitleComp />}
          <AppFormContent variant="primary" shadowed>
            <AppFormHeader
              formTypes={ACTION_TABS}
              activeFormKey={!rFormType ? 'deposit' : (rFormType as string)}
              handleClick={(key: string) => toggleForm(key as TransferFormType)}
              showMenuButton={isAvailableManageGauge}
            />

            <AppFormContentWrapper>
              {rFormType === 'swap' && (
                <>{poolAlert?.isDisableSwap ? <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox> : <Swap />}</>
              )}
              {rFormType === 'deposit' && <Deposit hasDepositAndStake={hasDepositAndStake} />}
              {rFormType === 'withdraw' && <Withdraw />}
              {rFormType === 'manage-gauge' && (
                <>
                  {poolData ? (
                    <ManageGauge poolId={poolData.pool.id} chainId={rChainId} />
                  ) : (
                    <BlockSkeleton width={339} />
                  )}
                </>
              )}
            </AppFormContentWrapper>
          </AppFormContent>
        </AppPageFormsWrapper>

        <AppPageInfoWrapper>
          {isMdUp && !chartExpanded && <TitleComp />}
          {poolAddress && (
            <Box margin="0 0 var(--spacing-2) 0">
              <CampaignRewardsBanner address={poolAddress} />
            </Box>
          )}
          {pricesApiPoolData && pricesApi && !chartExpanded && (
            <PriceAndTradesWrapper variant="secondary">
              <PoolInfoData rChainId={rChainId} pricesApiPoolData={pricesApiPoolData} />
            </PriceAndTradesWrapper>
          )}
          <AppPageInfoTabsWrapper>
            <Tabs>
              {poolInfoTabs.map(({ key, label }) => (
                <Tab
                  key={key}
                  className={selectedTab === key ? 'active' : ''}
                  variant="secondary"
                  disabled={!curve || !poolData}
                  onClick={() => setSelectedTab(key)}
                >
                  {label}
                </Tab>
              ))}
            </Tabs>
          </AppPageInfoTabsWrapper>

          <AppPageInfoContentWrapper variant="secondary">
            {selectedTab === 'user' && <MySharesStats />}
            {selectedTab === 'pool' && (
              <PoolStatsWrapper as="section" className={!curve || !poolData ? 'loading' : ''} variant="secondary">
                <PoolStats />
              </PoolStatsWrapper>
            )}
            {selectedTab === 'advanced' &&
              poolData &&
              snapshotsMapper[poolData.pool.address] !== undefined &&
              !basePoolsLoading && (
                <PoolParameters pricesApi={pricesApi} poolData={poolData} rChainId={rChainId} rPoolId={rPoolId} />
              )}
          </AppPageInfoContentWrapper>
        </AppPageInfoWrapper>
      </Wrapper>
    </PoolContext.Provider>
  )
}

const Wrapper = styled(AppPageFormContainer)<{ chartExpanded: boolean }>`
  @media (min-width: ${breakpoints.md}rem) {
    ${({ chartExpanded }) => chartExpanded && `margin-top: 1.5rem;`};
  }
`

const StyledChip = styled(Chip)`
  margin-left: var(--spacing-2);
  padding: 0 var(--spacing-1);

  color: black;
  background-color: white;
`

const StyledExternalLink = styled(ExternalLink)`
  color: var(--nav--page--color);
  text-transform: none;
`

const Title = styled(TextEllipsis)`
  background-color: rgba(0, 0, 0, 0.8);
  margin: var(--spacing-2) 0;
  font-size: var(--font-size-5);

  @media (max-width: ${breakpoints.xxs}rem) {
    max-width: 7.125rem; // 114px;
  }
`

const StatsWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;
`

const PoolStatsWrapper = styled(StatsWrapper)`
  grid-row-gap: 1rem;
`

const PriceAndTradesWrapper = styled(Box)`
  padding: 1.5rem 1rem;
  margin-bottom: var(--spacing-1);
  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: none;
    margin-bottom: var(--spacing-3);
  }
  @media (min-width: ${breakpoints.lg}rem) {
    padding: 1.5rem 1.5rem;
  }
`

const PriceAndTradesExpandedContainer = styled(Box)`
  margin: 1.5rem 0 0;
  display: flex;
  @media (min-width: ${breakpoints.md}rem) {
    flex-direction: column;
  }
`

const PriceAndTradesExpandedWrapper = styled(Box)``

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

export default Transfer
