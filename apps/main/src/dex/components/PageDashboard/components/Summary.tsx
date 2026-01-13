import { useState } from 'react'
import { Item, Section } from 'react-stately'
import { styled } from 'styled-components'
import ComboBoxAddress from '@/dex/components/PageDashboard/components/ComboBoxAddress'
import FormClaimFees from '@/dex/components/PageDashboard/components/FormClaimFees'
import FormVecrv from '@/dex/components/PageDashboard/components/FormVecrv'
import SummaryClaimable from '@/dex/components/PageDashboard/components/SummaryClaimable'
import SummaryRecurrence from '@/dex/components/PageDashboard/components/SummaryRecurrence'
import SummaryTotal from '@/dex/components/PageDashboard/components/SummaryTotal'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import useStore from '@/dex/store/useStore'
import Box from '@ui/Box'
import { SpinnerWrapper } from '@ui/Spinner'
import Stats from '@ui/Stats'
import { shortenAccount } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { useLayoutStore } from '@ui-kit/features/layout'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

type Tab = 'DAY_PROFITS' | 'CLAIMABLE_TOKENS'
const tabs: TabOption<Tab>[] = [
  { value: 'DAY_PROFITS', label: t`Daily Profits` },
  { value: 'CLAIMABLE_TOKENS', label: t`Claimable Tokens` },
]

const Summary = () => {
  const { rChainId, formValues, updateFormValues } = useDashboardContext()

  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const searchedWalletAddresses = useStore((state) => state.dashboard.searchedWalletAddresses)

  const networkHaveLockedCrv = rChainId === 1

  const [tab, setTab] = useState<Tab>('DAY_PROFITS')

  return (
    <div>
      <TitleWrapper className={`grid-total main ${networkHaveLockedCrv ? 'networkHaveLockedCrv' : ''}`}>
        <SummaryTotal />

        {/* veCrv */}
        {networkHaveLockedCrv && (
          <div style={{ gridArea: 'grid-summary-vecrv' }}>
            <FormVecrv />
            <FormClaimFees />
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
            <SummaryRecurrence title="Daily" />
            <SummaryClaimable title={tabs[1].label?.toString()} />
          </>
        ) : (
          <>
            <TabContentWrapper>
              <SummaryTitle>{t`Total Summary`}</SummaryTitle>
              <TabsSwitcher variant="underlined" value={tab} onChange={setTab} options={tabs} />
              {tab === 'DAY_PROFITS' && <SummaryRecurrence />}
              {tab === 'CLAIMABLE_TOKENS' && <SummaryClaimable />}
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

export const StyledTotalBalanceWrapper = styled.div`
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
