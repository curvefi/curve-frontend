import type { Contract } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { zeroAddress } from 'viem'
import { useAbiGaugeTotalSupply } from '@/lend/hooks/useAbiGaugeTotalSupply'
import { ChainId } from '@/lend/types/lend.types'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { weiToEther } from '@ui-kit/utils'

export const useAbiTotalSupply = (rChainId: ChainId, contractAddress: string | undefined) => {
  const contract = useAbiGaugeTotalSupply(rChainId, false, 'totalSupply', contractAddress)
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (contract && isValidAddress) void getTotalSupply(contract)
  }, [contract, isValidAddress, getTotalSupply])

  usePageVisibleInterval(() => {
    if (contract && isValidAddress) void getTotalSupply(contract)
  }, REFRESH_INTERVAL['1m'])

  return totalSupply
}
