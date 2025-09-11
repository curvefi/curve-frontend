import { useEffect, useState } from 'react'
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
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

type FormType = 'deposit' | 'withdraw'

const tabs: TabOption<FormType>[] = [
  { value: 'deposit', label: t`Deposit` },
  { value: 'withdraw', label: t`Withdraw` },
]

const tabsDeposit: TabOption<VaultDepositFormType>[] = [
  { value: 'deposit', label: t`Deposit` },
  { value: 'stake', label: t`Stake` },
]

const tabsWithdraw: TabOption<VaultWithdrawFormType>[] = [
  { value: 'withdraw', label: t`Withdraw` },
  { value: 'unstake', label: t`Unstake` },
  { value: 'claim', label: t`Claim Rewards` },
]

const Vault = (pageProps: PageContentProps & { params: MarketUrlParams }) => {
  const { rOwmId, rFormType, rChainId, params } = pageProps
  const push = useNavigate()

  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  type SubTab = VaultDepositFormType | VaultWithdrawFormType
  const [subTab, setSubTab] = useState<SubTab>('deposit')

  const subTabs = !rFormType || rFormType === 'deposit' ? tabsDeposit : tabsWithdraw

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
        options={tabs}
        fullWidth
      />

      <TabsSwitcher
        variant="underlined"
        size="small"
        value={subTab}
        onChange={setSubTab}
        options={subTabs}
        fullWidth
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
      />

      <AppFormContentWrapper>
        {subTab === 'deposit' && <VaultDepositMint {...pageProps} rFormType="deposit" />}
        {subTab === 'stake' && <VaultStake {...pageProps} rFormType="stake" />}
        {subTab === 'withdraw' && <VaultWithdrawRedeem {...pageProps} rFormType="withdraw" />}
        {subTab === 'unstake' && <VaultUnstake {...pageProps} rFormType="unstake" />}
        {subTab === 'claim' && <VaultClaim {...pageProps} rFormType="claim" />}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default Vault
