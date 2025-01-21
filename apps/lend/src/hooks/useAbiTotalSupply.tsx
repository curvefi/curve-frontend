import type { Contract } from 'ethers'

import { useCallback, useEffect, useState } from 'react'

import { INVALID_ADDRESS, REFRESH_INTERVAL } from '@lend/constants'
import { weiToEther } from '@ui-kit/utils'
import useContract from '@lend/hooks/useContract'
import usePageVisibleInterval from '@ui/hooks/usePageVisibleInterval'
import useStore from '@lend/store/useStore'
import { ChainId } from '@lend/types/lend.types'

const useAbiTotalSupply = (rChainId: ChainId, contractAddress: string | undefined) => {
  const contract = useContract(rChainId, false, 'totalSupply', contractAddress)
  const isValidAddress = contractAddress !== INVALID_ADDRESS

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
    if (contract && isValidAddress) getTotalSupply(contract)
  }, [contract, isValidAddress, getTotalSupply])

  usePageVisibleInterval(
    () => {
      if (contract && isValidAddress) getTotalSupply(contract)
    },
    REFRESH_INTERVAL['1m'],
    isPageVisible,
  )

  return totalSupply
}

export default useAbiTotalSupply
