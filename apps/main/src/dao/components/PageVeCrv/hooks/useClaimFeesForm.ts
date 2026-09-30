import { useConnection } from 'wagmi'
import { useClaimFeesMutation } from '@/dao/components/PageVeCrv/mutations/claim-fees.mutation'
import { useClaimableFees } from '@/dao/components/PageVeCrv/queries/claimable-fees.query'
import type { ChainId } from '@/dao/types/dao.types'

export const useClaimFeesForm = ({ chainId }: { chainId: ChainId }) => {
  const { address: userAddress } = useConnection()
  const params = { chainId, userAddress }
  const threeCrv = useClaimableFees({ ...params, token: '3CRV' })
  const crvUsd = useClaimableFees({ ...params, token: 'crvUSD' })
  const claimables = { '3CRV': threeCrv, crvUSD: crvUsd }

  const { onSubmit, error, isPending, claimingToken } = useClaimFeesMutation(params)

  return { userAddress, claimables, error, isPending, claimingToken, onSubmit }
}
