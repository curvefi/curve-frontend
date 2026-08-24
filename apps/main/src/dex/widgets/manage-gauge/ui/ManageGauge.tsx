import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { DepositReward } from '@/dex/features/deposit-gauge-reward'
import { ChainId } from '@/dex/types/main.types'
import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { FormContent } from '@evm-ui/widgets/DetailPageLayout/FormContent'

type Tab = 'add_reward' | 'deposit_reward'
type ManageGaugeProps = { chainId: ChainId; poolId: string; isGaugeManager: boolean; isRewardsDistributor: boolean }

const AddRewardTab = ({ chainId, poolId }: ManageGaugeProps) => <AddRewardToken chainId={chainId} poolId={poolId} />
const DepositRewardTab = ({ chainId, poolId }: ManageGaugeProps) => <DepositReward chainId={chainId} poolId={poolId} />

const menu: TabItem<Tab, ManageGaugeProps>[] = [
  { value: 'add_reward', label: t`Add Reward`, visible: p => p.isGaugeManager, component: AddRewardTab },
  {
    value: 'deposit_reward',
    label: t`Deposit Reward`,
    visible: p => p.isRewardsDistributor,
    component: DepositRewardTab,
  },
]

export const ManageGauge = ({ poolId, chainId, isGaugeManager, isRewardsDistributor }: ManageGaugeProps) => {
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
