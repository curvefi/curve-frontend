import useStore from '@/dao/store/useStore'

const useProposalMapper = () => {
  const proposalMapper = useStore((state) => state.proposals.proposalMapper)
  return { proposalMapper }
}

export default useProposalMapper
