import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import { useMemo } from 'react'
import useStore from '@/dao/store/useStore'
import { ProposalData, ProposalListFilter, SortByFilterProposals, SortDirection } from '@/dao/types/dao.types'
import { TIME_FRAMES } from '@ui-kit/lib/model'
import { useProposalsMapper } from '../entities/proposals-mapper'

const { WEEK } = TIME_FRAMES

const filterProposals = (proposals: ProposalData[], activeFilter: ProposalListFilter) => {
  if (activeFilter === 'all') return proposals
  if (activeFilter === 'executable') {
    return proposals.filter((proposal) => proposal.status === 'Passed' && !proposal.executed)
  }
  return proposals.filter((proposal) => proposal.status.toLowerCase() === activeFilter)
}

const sortProposals = (
  proposals: ProposalData[],
  activeSortBy: SortByFilterProposals,
  activeSortDirection: SortDirection,
) => {
  if (activeSortBy === 'endingSoon') {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const activeProposals = proposals.filter((proposal) => proposal.startDate + WEEK > currentTimestamp)
    const passedProposals = orderBy(
      proposals.filter((proposal) => proposal.startDate + WEEK < currentTimestamp),
      ['startDate'],
      ['desc'],
    )

    return activeSortDirection === 'asc'
      ? [
          ...orderBy(activeProposals, [(proposal) => proposal.startDate + WEEK - currentTimestamp], ['desc']),
          ...passedProposals,
        ]
      : [
          ...orderBy(activeProposals, [(proposal) => proposal.startDate + WEEK - currentTimestamp], ['asc']),
          ...passedProposals,
        ]
  }

  // sort by created time
  return orderBy(proposals, ['startDate'], [activeSortDirection])
}

const createFuseInstance = (proposals: ProposalData[]) =>
  new Fuse<ProposalData>(proposals, {
    ignoreLocation: true,
    threshold: 0.3,
    includeScore: true,
    keys: [
      'voteId',
      'creator',
      'voteType',
      {
        name: 'metaData',
        getFn: (proposal) => (proposal.metadata || '').toLowerCase(),
      },
    ],
  })

export const useProposalsList = () => {
  const activeSortBy = useStore((state) => state.proposals.activeSortBy)
  const activeSortDirection = useStore((state) => state.proposals.activeSortDirection)
  const activeFilter = useStore((state) => state.proposals.activeFilter)
  const searchValue = useStore((state) => state.proposals.searchValue)

  const { data: proposalsMapper, ...rest } = useProposalsMapper({})

  const processedData = useMemo(() => {
    if (!proposalsMapper) return { data: [] }

    const filteredProposals = filterProposals(Object.values(proposalsMapper), activeFilter)

    if (searchValue !== '') {
      const fuse = createFuseInstance(filteredProposals)
      const searchResults = fuse.search(searchValue).map((r) => r.item)
      return { data: sortProposals(searchResults, activeSortBy, activeSortDirection) }
    }

    return { data: sortProposals(filteredProposals, activeSortBy, activeSortDirection) }
  }, [proposalsMapper, activeFilter, searchValue, activeSortBy, activeSortDirection])

  return { ...processedData, ...rest }
}
