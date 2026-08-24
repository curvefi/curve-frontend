import { useMemo } from 'react'
import { useEnsName } from 'wagmi'
import { useVeCrvHoldersQuery } from '@/dao/entities/vecrv-holders'
import type { UserUrlParams } from '@/dao/types/dao.types'
import { useParams } from '@evm-ui/hooks/router'
import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Box from '@mui/material/Box'
import type { Address } from '@primitives/address.utils'
import { UserGaugeVotesTable } from './UserGaugeVotesTable'
import { UserHeader } from './UserHeader'
import { UserLocksTable } from './UserLocksTable'
import { UserProposalVotesTable } from './UserProposalVotesTable'
import { UserStats } from './UserStats'

type Tab = 'proposals' | 'gauge_votes' | 'locks'
type UserTabsParams = { userAddress: string; tableMinWidth: number }

const menu: TabItem<Tab, UserTabsParams>[] = [
  { value: 'proposals', label: t`User Proposal Votes`, component: UserProposalVotesTable },
  { value: 'gauge_votes', label: t`User Gauge Votes`, component: UserGaugeVotesTable },
  { value: 'locks', label: t`User Locks`, component: UserLocksTable },
]

export const User = () => {
  const { userAddress: rUserAddress } = useParams<UserUrlParams>()
  const { data: veCrvHolders, isLoading: holdersLoading } = useVeCrvHoldersQuery({})

  const userAddress = rUserAddress.toLowerCase()

  const tableMinWidth = 41.875
  const { tab, tabs, content, onChange } = useTabs({ menu, params: { userAddress, tableMinWidth } })

  const veCrvHolder = useMemo(
    () => veCrvHolders?.find(holder => holder.user.toLowerCase() === userAddress),
    [userAddress, veCrvHolders],
  )

  const { data: userEnsName } = useEnsName({ address: userAddress as Address })

  return (
    <DetailPageLayout formTabs={null} testId="user-page">
      <Box>
        <UserHeader userAddress={userAddress} userEnsName={userEnsName} />
        <UserStats veCrvHolder={veCrvHolder} holdersLoading={holdersLoading} />
      </Box>

      <Box>
        <TabsSwitcher variant="contained" value={tab.value} onChange={onChange} options={tabs} />
        {content}
      </Box>
    </DetailPageLayout>
  )
}
