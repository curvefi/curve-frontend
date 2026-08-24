import { useMemo } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { useConnection } from 'wagmi'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { DepositReward } from '@/dex/features/deposit-gauge-reward'
import { ChainId } from '@/dex/types/main.types'
import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { FormContent } from '@evm-ui/widgets/DetailPageLayout/FormContent'

type Tab = 'add_reward' | 'deposit_reward'
type ManageGaugeTabsParams = {
  chainId: ChainId
  poolId: string
  isGaugeManager: boolean
  isRewardsDistributor: boolean
}

const AddRewardTab = ({ chainId, poolId }: ManageGaugeTabsParams) => (
  <AddRewardToken chainId={chainId} poolId={poolId} />
)
const DepositRewardTab = ({ chainId, poolId }: ManageGaugeTabsParams) => (
  <DepositReward chainId={chainId} poolId={poolId} />
)

const menu: TabItem<Tab, ManageGaugeTabsParams>[] = [
  {
    value: 'add_reward',
    label: t`Add Reward`,
    visible: ({ isGaugeManager }) => isGaugeManager,
    component: AddRewardTab,
  },
  {
    value: 'deposit_reward',
    label: t`Deposit Reward`,
    visible: ({ isRewardsDistributor }) => isRewardsDistributor,
    component: DepositRewardTab,
  },
]

export const ManageGauge = ({ poolId, chainId }: { poolId: string; chainId: ChainId }) => {
  const { address: signerAddress } = useConnection()
  const { data: gaugeManager } = useGaugeManager({ chainId, poolId })
  const { data: rewardDistributors } = useGaugeRewardsDistributors({ chainId, poolId, userAddress: signerAddress })

  const isGaugeManager = useMemo(
    () => !!gaugeManager && !!signerAddress && isAddressEqual(gaugeManager, signerAddress),
    [gaugeManager, signerAddress],
  )

  const isRewardsDistributor = useMemo(
    () =>
      !!rewardDistributors &&
      !!signerAddress &&
      Object.values(rewardDistributors).some(distributorId => isAddressEqual(distributorId as Address, signerAddress)),
    [rewardDistributors, signerAddress],
  )

  const { tab, tabs, content, onChange } = useTabs({
    menu,
    params: { chainId, poolId, isGaugeManager, isRewardsDistributor },
  })

  return (
    <FormContent
      header={
        <TabsSwitcher variant="underlined" value={tab.value} onChange={onChange} options={tabs} overflow="fullWidth" />
      }
    >
      {content}
    </FormContent>
  )
}
