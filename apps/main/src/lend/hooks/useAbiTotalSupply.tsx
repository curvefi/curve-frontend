import type { Contract } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { zeroAddress } from 'viem'
import useContract from '@/lend/hooks/useContract'
import { ChainId } from '@/lend/types/lend.types'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { weiToEther } from '@ui-kit/utils'
import { errorFallback } from '@ui-kit/utils/error.util'

const useAbiTotalSupply = (rChainId: ChainId, contractAddress: string | undefined) => {
  const contract = useContract(rChainId, false, 'totalSupply', contractAddress)
  const isValidAddress = contractAddress !== zeroAddress

  const [totalSupply, settotalSupply] = useState<number | null>(null)

  const getTotalSupply = useCallback(async (contract: Contract) => {
    try {
      const totalSupply = await contract.totalSupply()
      settotalSupply(weiToEther(Number(totalSupply)))
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (contract && isValidAddress) getTotalSupply(contract).catch(errorFallback)
  }, [contract, isValidAddress, getTotalSupply])

  usePageVisibleInterval(() => contract && isValidAddress && getTotalSupply(contract), REFRESH_INTERVAL['1m'])

  return totalSupply
}

export default useAbiTotalSupply
