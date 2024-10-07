import { useGaugeManager, useGaugeRewardsDistributors } from '@/entities/gauge'
import { useSignerAddress } from '@/entities/signer'
import AddRewardToken from '@/features/add-gauge-reward-token'
import DepositReward from '@/features/deposit-gauge-reward'
import TabSlider, { Tab } from '@/ui/TabSlider/TabSlider'
import type { TabValue } from '@/widgets/manage-gauge/types'
import { useCallback, useMemo, useState } from 'react'
import { isAddressEqual, type Address } from 'viem'
import { sliderTabs } from '@/widgets/manage-gauge/model'

const ManageGauge: React.FC<{ poolId: string; chainId: ChainId }> = ({ poolId, chainId }) => {
  const [activeTab, setActiveTab] = useState<TabValue>('add_reward')
  const { data: signerAddress } = useSignerAddress()

  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager({ chainId, poolId })
  const { data: rewardDistributors, isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
  })

  const isGaugeManager = useMemo(() => {
    return !!gaugeManager && !!signerAddress && isAddressEqual(gaugeManager, signerAddress)
  }, [gaugeManager, signerAddress])

  const isRewardsDistributor = useMemo(
    () =>
      !!rewardDistributors &&
      !!signerAddress &&
      Object.values(rewardDistributors).some((distributorId) =>
        isAddressEqual(distributorId as Address, signerAddress)
      ),
    [rewardDistributors, signerAddress]
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
    [isGaugeManager, isRewardsDistributor]
  )

  return (
    <>
      <TabSlider tabs={sliderTabs} activeTab={activeTab} onTabChange={setActiveTab} isTabVisible={isTabVisible} />
      {renderActiveTab()}
    </>
  )
}

export default ManageGauge
