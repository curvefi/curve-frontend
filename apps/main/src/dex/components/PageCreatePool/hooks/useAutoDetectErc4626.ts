import { useEffect } from 'react'
import { NG_ASSET_TYPE } from '@/dex/components/PageCreatePool/constants'
import { useIsErc4626 } from '@/dex/components/PageCreatePool/hooks/useIsErc4626'
import { TokenId } from '@/dex/components/PageCreatePool/types'
import { useStore } from '@/dex/store/useStore'
import type { Address } from '@primitives/address.utils'

type UseAutoDetectErc4626Params = {
  tokenId: TokenId
  address: Address
}

/**
 * This hook is used to automatically detect if a token is an ERC4626 token and set the asset type to ERC4626
 */
export const useAutoDetectErc4626 = ({ tokenId, address }: UseAutoDetectErc4626Params) => {
  const updateNgAssetType = useStore((state) => state.createPool.updateNgAssetType)
  const updateTokenErc4626Status = useStore((state) => state.createPool.updateTokenErc4626Status)
  // check if the status is already set to avoid overriding the user's choice when switching the order of tokens
  const statusAlreadySet = useStore((state) => state.createPool.tokensInPool[tokenId].erc4626.isSuccess)
  const { isErc4626, isLoading, error, isSuccess } = useIsErc4626({ address })

  useEffect(() => {
    if (isLoading || error || isSuccess) {
      updateTokenErc4626Status(tokenId, { isErc4626, isLoading, error, isSuccess })
    }

    // Only auto-set ngAssetType on first successful detection (don't override user's choice)
    if (isErc4626 && !statusAlreadySet) {
      updateNgAssetType(tokenId, NG_ASSET_TYPE.ERC4626)
    }
  }, [tokenId, isErc4626, isSuccess, isLoading, error, updateNgAssetType, updateTokenErc4626Status, statusAlreadySet])
}
