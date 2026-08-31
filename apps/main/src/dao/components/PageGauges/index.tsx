import { networksIdMapper } from '@/dao/networks'
import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { useParams } from '@evm-ui/hooks/router'
import { useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Stack from '@mui/material/Stack'
import { GaugesList } from './GaugeList'
import { GaugeVoting } from './GaugeVoting'
import { GaugeWeightDistribution } from './GaugeWeightDistribution'

const menu = [
  { value: 'gaugeList', label: t`Gauges`, component: GaugesList },
  { value: 'gaugeVoting', label: t`Voting`, component: GaugeVoting },
] as const

export const Gauges = () => {
  const { network } = useParams<NetworkUrlParams>()
  const chainId = networksIdMapper[network]
  const { tab, tabs, content, onChange } = useTabs({ menu, params: { chainId } })
  return (
    <DetailPageLayout formTabs={null} testId="gauges-page">
      <GaugeWeightDistribution chainId={chainId} isUserVotes={tab.value === 'gaugeVoting'} />
      <Stack>
        <TabsSwitcher value={tab.value} onChange={onChange} options={tabs} />
        {content}
      </Stack>
    </DetailPageLayout>
  )
}
