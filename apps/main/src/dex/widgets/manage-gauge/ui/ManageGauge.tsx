import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { DepositReward } from '@/dex/features/deposit-gauge-reward'
import { ChainId } from '@/dex/types/main.types'
import { t } from '@evm-ui/lib/i18n'
import { FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'

type ManageGaugeProps = { chainId: ChainId; poolId: string; isGaugeManager: boolean; isRewardsDistributor: boolean }

const AddRewardTab = ({ chainId, poolId }: ManageGaugeProps) => <AddRewardToken chainId={chainId} poolId={poolId} />
const DepositRewardTab = ({ chainId, poolId }: ManageGaugeProps) => <DepositReward chainId={chainId} poolId={poolId} />

// todo: these should be subtabs defined in the pool page
const menu = [
  {
    value: 'add_reward',
    label: t`Add Reward`,
    visible: (p: ManageGaugeProps) => p.isGaugeManager,
    component: AddRewardTab,
  },
  {
    value: 'deposit_reward',
    label: t`Deposit Reward`,
    visible: (p: ManageGaugeProps) => p.isRewardsDistributor,
    component: DepositRewardTab,
  },
] as const

export const ManageGauge = (params: ManageGaugeProps) => <FormTabs menu={menu} params={params} overflow="fullWidth" />
