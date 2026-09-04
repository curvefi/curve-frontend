import { useMemo } from 'react'
import { useEnsName } from 'wagmi'
import { useVeCrvHoldersQuery } from '@/dao/entities/vecrv-holders'
import type { UserUrlParams } from '@/dao/types/dao.types'
import { useParams } from '@evm-ui/hooks/router'
import { Tabs } from '@evm-ui/shared/ui/Tabs/Tabs'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import Box from '@mui/material/Box'
import type { Address } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'
import { UserGaugeVotesTable } from './UserGaugeVotesTable'
import { UserHeader } from './UserHeader'
import { UserLocksTable } from './UserLocksTable'
import { UserProposalVotesTable } from './UserProposalVotesTable'
import { UserStats } from './UserStats'

const menu = [
  { value: 'proposals', label: t`User Proposal Votes`, component: UserProposalVotesTable },
  { value: 'gauge_votes', label: t`User Gauge Votes`, component: UserGaugeVotesTable },
  { value: 'locks', label: t`User Locks`, component: UserLocksTable },
]

export const User = () => {
  const { userAddress: rUserAddress } = useParams<UserUrlParams>()
  const { data: veCrvHolders, isLoading: holdersLoading } = useVeCrvHoldersQuery({})

  const userAddress = rUserAddress.toLowerCase()

  const tableMinWidth = 41.875

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
        <Tabs menu={menu} params={useMemo(() => ({ userAddress, tableMinWidth }), [userAddress])} variant="contained" />
      </Box>
    </DetailPageLayout>
  )
}
