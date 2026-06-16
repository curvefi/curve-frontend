import { useMemo, useState } from 'react'
import { useEnsName } from 'wagmi'
import { useVeCrvHoldersQuery, type VeCrvHolder } from '@/dao/entities/vecrv-holders'
import type { UserUrlParams } from '@/dao/types/dao.types'
import Box from '@mui/material/Box'
import type { Address } from '@primitives/address.utils'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { decimal } from '@ui-kit/utils'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { UserGaugeVotesTable } from './UserGaugeVotesTable'
import { UserHeader } from './UserHeader'
import { UserLocksTable } from './UserLocksTable'
import { UserProposalVotesTable } from './UserProposalVotesTable'
import { UserStats } from './UserStats'

type Tab = 'proposals' | 'gauge_votes' | 'locks'
const tabs: TabOption<Tab>[] = [
  { value: 'proposals', label: t`User Proposal Votes` },
  { value: 'gauge_votes', label: t`User Gauge Votes` },
  { value: 'locks', label: t`User Locks` },
]

export const User = () => {
  const { userAddress: rUserAddress } = useParams<UserUrlParams>()
  const { data: veCrvHolders = [], isLoading: holdersLoading } = useVeCrvHoldersQuery({})
  const [tab, setTab] = useState<Tab>('proposals')

  const userAddress = rUserAddress.toLowerCase()

  const tableMinWidth = 41.875

  const veCrvHolder = useMemo<VeCrvHolder>(
    () =>
      veCrvHolders.find(holder => holder.user.toLowerCase() === userAddress) ?? {
        user: rUserAddress as VeCrvHolder['user'],
        locked: decimal(0)!,
        weight: decimal(0)!,
        weightRatio: decimal(0)!,
        unlockTime: null,
      },
    [rUserAddress, userAddress, veCrvHolders],
  )

  const { data: userEnsName } = useEnsName({ address: userAddress as Address })

  return (
    <DetailPageLayout formTabs={null} testId="user-page">
      <Box>
        <UserHeader userAddress={userAddress} userEnsName={userEnsName} />
        <UserStats veCrvHolder={veCrvHolder} holdersLoading={holdersLoading} />
      </Box>

      <Box>
        <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />
        {tab === 'proposals' && <UserProposalVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />}
        {tab === 'gauge_votes' && <UserGaugeVotesTable userAddress={userAddress} tableMinWidth={tableMinWidth} />}
        {tab === 'locks' && <UserLocksTable userAddress={userAddress} />}
      </Box>
    </DetailPageLayout>
  )
}
