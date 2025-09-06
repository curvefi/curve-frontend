import { useRef, useEffect } from 'react'
import VaultClaim from '@/lend/components/PageVault/VaultClaim'
import VaultDepositMint from '@/lend/components/PageVault/VaultDepositMint'
import VaultStake from '@/lend/components/PageVault/VaultStake'
import VaultUnstake from '@/lend/components/PageVault/VaultUnstake'
import VaultWithdrawRedeem from '@/lend/components/PageVault/VaultWithdrawRedeem'
import useStore from '@/lend/store/useStore'
import {
  type MarketUrlParams,
  PageContentProps,
  type VaultDepositFormType,
  type VaultWithdrawFormType,
} from '@/lend/types/lend.types'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper, AppFormSlideTab } from '@ui/AppForm'
import SlideTabsWrapper, { SlideTabs } from '@ui/TabSlide'
import { useNavigate } from '@ui-kit/hooks/router'
import useSlideTabState from '@ui-kit/hooks/useSlideTabState'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const Vault = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, rChainId, params } = pageProps
  const push = useNavigate()
  const tabsRef = useRef<HTMLDivElement>(null)

  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  const { selectedTabIdx, tabPositions, setSelectedTabIdx } = useSlideTabState(tabsRef, rFormType)

  const FORM_TYPES: { value: string; label: string }[] = [
    { value: 'deposit', label: t`Deposit` },
    { value: 'withdraw', label: t`Withdraw` },
  ]

  const DEPOSIT_TABS: { label: string; formType: VaultDepositFormType }[] = [
    { label: t`Deposit`, formType: 'deposit' },
    { label: t`Stake`, formType: 'stake' },
  ]

  const WITHDRAW_TABS: { label: string; formType: VaultWithdrawFormType }[] = [
    { label: t`Withdraw`, formType: 'withdraw' },
    { label: t`Unstake`, formType: 'unstake' },
    { label: t`Claim Rewards`, formType: 'claim' },
  ]

  const tabs = !rFormType || rFormType === 'deposit' ? DEPOSIT_TABS : WITHDRAW_TABS

  // init campaignRewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  return (
    <AppFormContent variant="primary">
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'deposit' : rFormType}
        onChange={(key) => push(getVaultPathname(params, rOwmId, key))}
        options={FORM_TYPES}
      />

      <AppFormContentWrapper>
        {/* FORMS SELECTOR */}
        {tabs.length > 0 && (
          <SlideTabsWrapper activeIdx={selectedTabIdx}>
            <SlideTabs ref={tabsRef}>
              {tabs.map(({ label }, idx) => (
                <AppFormSlideTab
                  key={label}
                  disabled={selectedTabIdx === idx}
                  tabLeft={tabPositions[idx]?.left}
                  tabWidth={tabPositions[idx]?.width}
                  tabTop={tabPositions[idx]?.top}
                  onChange={() => setSelectedTabIdx(idx)}
                  tabIdx={idx}
                  label={label}
                />
              ))}
            </SlideTabs>
          </SlideTabsWrapper>
        )}

        {/* FORMS */}
        {rFormType === '' || rFormType === 'deposit' ? (
          <>
            {selectedTabIdx === 0 && <VaultDepositMint {...pageProps} rFormType="deposit" />}
            {selectedTabIdx === 1 && <VaultStake {...pageProps} rFormType="stake" />}
          </>
        ) : rFormType === 'withdraw' ? (
          <>
            {selectedTabIdx === 0 && <VaultWithdrawRedeem {...pageProps} rFormType="withdraw" />}
            {selectedTabIdx === 1 && <VaultUnstake {...pageProps} rFormType="unstake" />}
            {selectedTabIdx === 2 && <VaultClaim {...pageProps} rFormType="claim" />}
          </>
        ) : null}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default Vault
