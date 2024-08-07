import type { Tab } from '@/shared/ui/tab-slider/TabSlider'
import type { TabValue } from '@/widgets/manage-gauge/types'
import { t } from '@lingui/macro'

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
