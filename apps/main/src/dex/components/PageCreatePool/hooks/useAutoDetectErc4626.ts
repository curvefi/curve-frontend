import { useCallback, useState } from 'react'
import { isAddress, isAddressEqual, type Address } from 'viem'
import { NG_ASSET_TYPE } from '@/dex/components/PageCreatePool/constants'
import { useIsErc4626 } from '@/dex/components/PageCreatePool/hooks/useIsErc4626'
import { TokenId, TokenState, TokensInPoolState } from '@/dex/components/PageCreatePool/types'
import { DEFAULT_ERC4626_STATUS } from '@/dex/store/createCreatePoolSlice'
import useStore from '@/dex/store/useStore'

type Candidate = {
  tokenId: TokenId
  address: Address
}

type UseAutoDetectErc4626Params = {
  tokensInPool: TokensInPoolState
}

/**
 * This hook is used to automatically detect if a token is an ERC4626 token and set the asset type to ERC4626
 * @param tokensInPool - The tokens in the pool
 * @returns A function to schedule a check for an ERC4626 token
 */
export const useAutoDetectErc4626 = ({ tokensInPool }: UseAutoDetectErc4626Params) => {
  const updateNgAssetType = useStore((state) => state.createPool.updateNgAssetType)
  const updateTokenErc4626Status = useStore((state) => state.createPool.updateTokenErc4626Status)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const { isErc4626, isLoading, error, isSuccess } = useIsErc4626({ address: candidate?.address })

  const setStatus = useCallback(
    (tokenId: TokenId, status: TokenState['erc4626']) => {
      updateTokenErc4626Status(tokenId, status)
    },
    [updateTokenErc4626Status],
  )

  const scheduleCheck = useCallback(
    (tokenId: TokenId, address: Address) => {
      setCandidate({ tokenId, address })
      setStatus(tokenId, {
        ...DEFAULT_ERC4626_STATUS,
        isLoading: true,
      })
    },
    [setStatus],
  )

  if (candidate) {
    const currentToken = tokensInPool[candidate.tokenId]
    if (!currentToken) {
      setCandidate(null)
    } else {
      const nextStatus: TokenState['erc4626'] = {
        isErc4626: Boolean(isErc4626 && isSuccess),
        isLoading,
        error,
        isSuccess,
      }

      const currentStatus = currentToken.erc4626
      const statusChanged =
        currentStatus.isErc4626 !== nextStatus.isErc4626 ||
        currentStatus.isLoading !== nextStatus.isLoading ||
        currentStatus.error !== nextStatus.error ||
        currentStatus.isSuccess !== nextStatus.isSuccess

      if (statusChanged) {
        setStatus(candidate.tokenId, nextStatus)
      }

      if (!isLoading) {
        const currentAddress = tokensInPool[candidate.tokenId].address
        const addressesMatch = isAddress(currentAddress) && isAddressEqual(currentAddress, candidate.address)

        if (!addressesMatch) {
          if (currentStatus.isErc4626 || currentStatus.isLoading || currentStatus.error || currentStatus.isSuccess) {
            setStatus(candidate.tokenId, { ...DEFAULT_ERC4626_STATUS })
          }
          setCandidate(null)
        } else {
          if (isErc4626) {
            updateNgAssetType(candidate.tokenId, NG_ASSET_TYPE.ERC4626)
          }
          setCandidate(null)
        }
      }
    }
  }

  return {
    scheduleCheck,
  }
}
