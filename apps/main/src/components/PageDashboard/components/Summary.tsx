import type { Params } from 'react-router'
import type { FormValues } from '@/components/PageDashboard/types'
import type { TooltipProps } from '@/ui/Tooltip/types'

import { t } from '@lingui/macro'
import { Item, Section } from 'react-stately'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_WALLET_DASHBOARD_DATA } from '@/components/PageDashboard/utils'
import { breakpoints } from '@/ui/utils/responsive'
import { formatNumber, shortenAccount } from '@/ui/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import ComboBoxAddress from '@/components/PageDashboard/components/ComboBoxAddress'
import FormClaimFees from '@/components/PageDashboard/components/FormClaimFees'
import FormVecrv from '@/components/PageDashboard/components/FormVecrv'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import Stats from '@/ui/Stats'
import SummaryClaimable from '@/components/PageDashboard/components/SummaryClaimable'
import SummaryRecurrence from '@/components/PageDashboard/components/SummaryRecurrence'
import TabSlide, { SlideTab, SlideTabs } from '@/ui/TabSlide'

type SlideKey = 'DAY_PROFITS' | 'CLAIMABLE_TOKENS'

export const tooltipProps: TooltipProps = {
  placement: 'bottom end',
  textAlign: 'end',
  noWrap: true,
}

const Summary = ({
  activeKey,
  curve,
  rChainId,
  params,
  updateFormValues,
}: {
  activeKey: string
  curve: CurveApi | null
  rChainId: ChainId
  params: Readonly<Params<string>>
  updateFormValues: (updatedFormValues: Partial<FormValues>) => void
}) => {
  const tabsRef = useRef<HTMLDivElement>(null)

  const isMdUp = useStore((state) => state.isMdUp)
  const formValues = useStore((state) => state.dashboard.formValues)
  const dashboardLoading = useStore((state) => state.dashboard.loading)
  const searchedWalletAddresses = useStore((state) => state.dashboard.searchedWalletAddresses)
  const walletDashboardData = useStore(
    (state) => state.dashboard.walletDashboardData[activeKey] ?? DEFAULT_WALLET_DASHBOARD_DATA
  )

  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])
  const [selectedTabSlideIdx, setSelectedTabSlideIdx] = useState(0)
  const networkHaveLockedCrv = networks[rChainId].forms.indexOf('BOOSTING') !== -1

  const TABS: { label: string; key: SlideKey }[] = [
    { label: t`Daily Profits`, key: 'DAY_PROFITS' },
    { label: t`Claimable Tokens`, key: 'CLAIMABLE_TOKENS' },
  ]

  // tabs positions
  useEffect(() => {
    if (!tabsRef.current) return

    const tabsNode = tabsRef.current
    const tabsDOMRect = tabsNode.getBoundingClientRect()
    const updatedTabPositions = Array.from(tabsNode.childNodes as NodeListOf<HTMLInputElement>)
      .filter((n) => n.classList.contains('tab'))
      .map((n, idx) => {
        const domRect = n.getBoundingClientRect()
        const left = idx == -0 ? 0 : domRect.left - tabsDOMRect.left
        const top = domRect.bottom - tabsDOMRect.top
        return { left, width: domRect.width, top }
      })

    setTabPositions(updatedTabPositions)
  }, [])

  const haveTotalLiquidityUsd =
    formValues.walletAddress && typeof walletDashboardData?.totalLiquidityUsd !== 'undefined'
  const loadingTotalBalances = dashboardLoading && !haveTotalLiquidityUsd
  const totalBalanceValue = !loadingTotalBalances && haveTotalLiquidityUsd ? walletDashboardData.totalLiquidityUsd : ''

  return (
    <div>
      <TitleWrapper className={`grid-total main ${networkHaveLockedCrv ? 'networkHaveLockedCrv' : ''}`}>
        {/* total balance */}
        <StyledTotalBalanceWrapper style={{ gridArea: 'grid-summary-total-balance' }}>
          <H2>{t`Total Balances`}</H2>
          <SummaryInnerContent>
            {loadingTotalBalances && (
              <SummarySpinnerWrapper isMain>
                <Spinner />
              </SummarySpinnerWrapper>
            )}
            <TotalBalancesValue tooltip={formatNumber(totalBalanceValue)} tooltipProps={{ noWrap: true }}>
              {formatNumber(totalBalanceValue, { notation: 'compact', defaultValue: '0' })}
            </TotalBalancesValue>
          </SummaryInnerContent>
        </StyledTotalBalanceWrapper>

        {/* veCrv */}
        {networkHaveLockedCrv && (
          <div style={{ gridArea: 'grid-summary-vecrv' }}>
            <FormVecrv activeKey={activeKey} params={params} curve={curve} walletAddress={formValues.walletAddress} />
            <FormClaimFees activeKey={activeKey} loading={dashboardLoading} walletAddress={formValues.walletAddress} />
          </div>
        )}

        {/* wallet address search */}
        <AddressSearchWrapper
          className={networkHaveLockedCrv ? 'networkHaveLockedCrv' : ''}
          style={{ gridArea: 'grid-summary-search-address' }}
        >
          <ComboBoxAddress
            label={t`View address`}
            allowsCustomValue
            defaultInputValue={formValues.walletAddress}
            inputValue={formValues.walletAddress}
            placeholder="0x..."
            onInputChange={(walletAddress) => updateFormValues({ walletAddress })}
            onSelectionChange={(val) => updateFormValues({ walletAddress: val as string })}
          >
            <Section title={t`Recently viewed addresses`}>
              {searchedWalletAddresses.map((address) => (
                <Item key={address} textValue={address}>
                  {shortenAccount(address)}
                </Item>
              ))}
            </Section>
          </ComboBoxAddress>
        </AddressSearchWrapper>
      </TitleWrapper>
      <ContentWrapper>
        {isMdUp ? (
          <>
            <SummaryRecurrence
              title="Daily"
              dashboardLoading={dashboardLoading}
              walletAddress={formValues.walletAddress}
              walletDashboardData={walletDashboardData}
            />
            <SummaryClaimable
              title={TABS[1].label}
              dashboardLoading={dashboardLoading}
              walletAddress={formValues.walletAddress}
              walletDashboardData={walletDashboardData}
            />
          </>
        ) : (
          <>
            <TabContentWrapper>
              <SummaryTitle>{t`Total Summary`}</SummaryTitle>
              <StyledTabSlide activeIdx={selectedTabSlideIdx}>
                <SlideTabs ref={tabsRef}>
                  {TABS.map(({ key, label }, idx) => {
                    return (
                      <SlideTab
                        key={key}
                        tabLeft={tabPositions[idx]?.left}
                        tabWidth={tabPositions[idx]?.width}
                        tabTop={tabPositions[idx]?.top}
                        onChange={() => setSelectedTabSlideIdx(idx)}
                        tabIdx={idx}
                        label={label}
                      />
                    )
                  })}
                </SlideTabs>
              </StyledTabSlide>
              <div>
                {selectedTabSlideIdx === 0 && (
                  <SummaryRecurrence
                    dashboardLoading={dashboardLoading}
                    walletAddress={formValues.walletAddress}
                    walletDashboardData={walletDashboardData}
                  />
                )}
                {selectedTabSlideIdx === 1 && (
                  <SummaryClaimable
                    dashboardLoading={dashboardLoading}
                    walletAddress={formValues.walletAddress}
                    walletDashboardData={walletDashboardData}
                  />
                )}
              </div>
            </TabContentWrapper>
          </>
        )}
      </ContentWrapper>
    </div>
  )
}

export default Summary

const AddressSearchWrapper = styled.div`
  display: flex;
  justify-content: right;

  @media (min-width: ${breakpoints.lg}rem) {
    &.networkHaveLockedCrv {
      border-left: 1px solid var(--summary_header--border-color);
    }
  }
`

export const StyledStats = styled(Stats)`
  border-color: var(--summary_content--border-color);
`

const StyledTabSlide = styled(TabSlide)`
  margin: 1rem 0;

  label {
    color: var(--page--text-color);
  }

  .tab-slider {
    background: var(--page--text-color);
  }
`

const TabContentWrapper = styled(Box)``

const TabWrapper = styled(Box)``

export const SummaryTitle = styled.h3`
  font-size: var(--font-size-3);
  margin-bottom: 0.5rem;

  @media (min-width: ${breakpoints.sm}rem) {
    margin-bottom: 1rem;
  }

  @media (min-width: ${breakpoints.md}rem) {
    margin-bottom: 0.5rem;
  }
`

const TotalBalancesValue = styled(Chip)`
  font-size: var(--font-size-7);
  font-weight: bold;
`

const H2 = styled.h2`
  font-family: var(--button--font);
  font-size: var(--font-size-3);
  margin-bottom: 0.25rem;
`

const StyledTotalBalanceWrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
`

const TitleWrapper = styled.div`
  display: grid;
  padding: 3rem 1rem 1rem 1rem;
  background-color: var(--summary_header--background-color);

  grid-gap: 1rem;
  grid-template-areas:
    'grid-summary-search-address'
    'grid-summary-total-balance'
    'grid-summary-vecrv';

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 3rem 2rem 1.5rem 2rem;
    grid-template-areas:
      'grid-summary-search-address grid-summary-search-address grid-summary-search-address'
      'grid-summary-total-balance grid-summary-vecrv grid-summary-vecrv';
  }

  @media (min-width: ${breakpoints.md}rem) {
    grid-template-areas: 'grid-summary-total-balance grid-summary-vecrv grid-summary-search-address grid-summary-search-address';

    &.networkHaveLockedCrv ${StyledTotalBalanceWrapper} {
      border-right: 1px solid var(--summary_header--border-color);
    }
  }
`

export const SummarySpinnerWrapper = styled(SpinnerWrapper)<{ isMain?: boolean }>`
  padding: var(--spacing-1);
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: ${({ isMain }) => {
    if (isMain) {
      return 'var(--summary_header--loading--background-color)'
    }
    return 'var(--summary_content--loading--background-color)'
  }};
`

export const SummaryInnerContent = styled(Box)`
  position: relative;
  min-height: 4.375rem; // 70px
`

const ContentWrapper = styled.div`
  display: grid;
  padding: 1rem;
  grid-gap: 2.5rem;
  background-color: var(--summary_content--background-color);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 2rem 3rem 1rem 3rem;
  }

  @media (min-width: ${breakpoints.md}rem) {
    grid-template-columns: repeat(2, 1fr);

    ${TabWrapper} {
      display: none;
    }
  }

  @media (min-width: ${breakpoints.lg}rem) {
    padding: 2rem 5rem 1rem 5rem;
  }
`
