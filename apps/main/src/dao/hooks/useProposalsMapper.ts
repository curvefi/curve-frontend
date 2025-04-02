import useStore from '@/dao/store/useStore'

const useProposalsMapper = () => {
  const proposalsMapper = useStore((state) => state.proposals.proposalsMapper)
  return { proposalsMapper }
}

export default useProposalsMapper
