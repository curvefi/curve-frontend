import type { Tab } from '@/ui/TabSlider/TabSlider'
import { t } from '@lingui/macro'
import type { TabValue } from '@/widgets/manage-gauge/types'

export const sliderTabs: Tab<TabValue>[] = [
  {
    label: t`Add Reward`,
    value: 'add_reward',
  },
  {
    label: t`Deposit Reward`,
    value: 'deposit_reward',
  },
] as const
