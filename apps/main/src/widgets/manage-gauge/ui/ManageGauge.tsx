import { t } from '@lingui/macro'
import TabSlider, { Tab } from '@/ui/TabSlider/TabSlider'
import { useCallback, useMemo, useState } from 'react'
import { isAddressEqual, type Address } from 'viem'
import type { TabValue } from '@/widgets/manage-gauge/types'
import AddRewardToken from '@/features/add-gauge-reward-token'
import DepositReward from '@/features/deposit-gauge-reward'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/entities/gauge'
import { useSignerAddress } from '@/entities/signer'
import { ChainId } from '@/types/main.types'

const ManageGauge: React.FC<{ poolId: string; chainId: ChainId }> = ({ poolId, chainId }) => {
  const sliderTabs: Tab<TabValue>[] = [
    {
      label: t`Add Reward`,
      value: 'add_reward',
    },
    {
      label: t`Deposit Reward`,
      value: 'deposit_reward',
    },
  ]

  const [activeTab, setActiveTab] = useState<TabValue>('add_reward')
  const { data: signerAddress } = useSignerAddress()

  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager({ chainId, poolId })
  const { data: rewardDistributors, isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
  })

  const isGaugeManager = useMemo(
    () => !!gaugeManager && !!signerAddress && isAddressEqual(gaugeManager, signerAddress),
    [gaugeManager, signerAddress],
  )

  const isRewardsDistributor = useMemo(
    () =>
      !!rewardDistributors &&
      !!signerAddress &&
      Object.values(rewardDistributors).some((distributorId) =>
        isAddressEqual(distributorId as Address, signerAddress),
      ),
    [rewardDistributors, signerAddress],
  )

  const renderActiveTab = useCallback(() => {
    switch (activeTab) {
      case 'add_reward':
        return <AddRewardToken chainId={chainId} poolId={poolId} />
      case 'deposit_reward':
        return <DepositReward chainId={chainId} poolId={poolId} />
      default:
        return null
    }
  }, [activeTab, chainId, poolId])

  const isTabVisible = useCallback(
    (tab: Tab<TabValue>) => {
      if (tab.value === 'add_reward') {
        return isGaugeManager
      }
      if (tab.value === 'deposit_reward') {
        return isGaugeManager && isRewardsDistributor
      }
      return false
    },
    [isGaugeManager, isRewardsDistributor],
  )

  return (
    <>
      <TabSlider tabs={sliderTabs} activeTab={activeTab} onTabChange={setActiveTab} isTabVisible={isTabVisible} />
      {renderActiveTab()}
    </>
  )
}

export default ManageGauge
