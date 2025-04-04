import type { Contract } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { zeroAddress } from 'viem'
import useContract from '@/lend/hooks/useContract'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { weiToEther } from '@ui-kit/utils'

const useAbiTotalSupply = (rChainId: ChainId, contractAddress: string | undefined) => {
  const contract = useContract(rChainId, false, 'totalSupply', contractAddress)
  const isValidAddress = contractAddress !== zeroAddress

  const isPageVisible = useStore((state) => state.isPageVisible)

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
    if (contract && isValidAddress) void getTotalSupply(contract)
  }, [contract, isValidAddress, getTotalSupply])

  usePageVisibleInterval(
    () => {
      if (contract && isValidAddress) void getTotalSupply(contract)
    },
    REFRESH_INTERVAL['1m'],
    isPageVisible,
  )

  return totalSupply
}

export default useAbiTotalSupply
