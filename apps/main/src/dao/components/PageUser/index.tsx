import { useEffect, useState } from 'react'
import { useEnsName } from 'wagmi'
import { useStore } from '@/dao/store/useStore'
import type { UserUrlParams } from '@/dao/types/dao.types'
import type { Locker } from '@curvefi/prices-api/dao'
import Box from '@mui/material/Box'
import type { Address } from '@primitives/address.utils'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
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
  const veCrvHolders = useStore(state => state.analytics.veCrvHolders)
  const getVeCrvHolders = useStore(state => state.analytics.getVeCrvHolders)
  const [tab, setTab] = useState<Tab>('proposals')

  const { allHolders, fetchStatus } = veCrvHolders

  const userAddress = rUserAddress.toLowerCase()

  const tableMinWidth = 41.875

  const holdersLoading = fetchStatus === 'LOADING'
  const holdersError = fetchStatus === 'ERROR'

  const veCrvHolder: Locker = allHolders[userAddress] || {
    user: rUserAddress,
    locked: 0n,
    weight: 0n,
    weightRatio: 0,
    unlockTime: null,
  }

  useEffect(() => {
    if (Object.keys(allHolders).length === 0 && holdersLoading && !holdersError) {
      void getVeCrvHolders()
    }
  }, [getVeCrvHolders, allHolders, holdersLoading, holdersError])

  const { data: userEnsName } = useEnsName({ address: userAddress as Address })

  return (
    <DetailPageLayout formTabs={null}>
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
