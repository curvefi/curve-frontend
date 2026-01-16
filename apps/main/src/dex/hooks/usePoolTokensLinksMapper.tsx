import { useEffect, useState } from 'react'
import { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'

enum Pool {
  fantomFactoryStableNg24 = `250-factory-stable-ng-24`,
  fantomFactoryStableNg39 = '250-factory-stable-ng-39',
}

// Custom link for each token in a pool.
export const usePoolTokensLinksMapper = (rChainId: ChainId, { pool }: PoolDataCacheOrApi) => {
  const poolId = pool?.id

  const [mapper, setMapper] = useState<{ [tokenAddress: string]: string } | null>(null)

  useEffect(() => {
    if (!rChainId && !poolId) return

    const key = `${rChainId}-${poolId}`

    if (key === Pool.fantomFactoryStableNg24) {
      // prettier-ignore
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMapper({
        '0x14f8e5851879a18e0fea77b5a17f15523262a99e': getInternalUrl('dex', 'ethereum', `${DEX_ROUTES.PAGE_POOLS}/3pool/deposit`), //s3Crv_e
        '0x2902257ba817e1436b93f9f959ed50b95560b7d5': getInternalUrl('dex', 'arbitrum', `${DEX_ROUTES.PAGE_POOLS}/2pool/deposit`), //s2CRV_ar
        '0x740568006c07888216649632aace6620288c7078': getInternalUrl('dex', 'optimism', `${DEX_ROUTES.PAGE_POOLS}/3pool/deposit`), //s3CRV_o
        '0x9be1ae6175b106f26439cebaf2217d7815f684af': getInternalUrl('dex', 'avalanche', `${DEX_ROUTES.PAGE_POOLS}/aave/deposit`), //sav3CRV_av
        '0x4636a4efba1c02917d0584505e47bb2d22afe359': getInternalUrl('dex', 'polygon', `${DEX_ROUTES.PAGE_POOLS}/aave/deposit`), //sam3CRV_p
        '0xab72e7f7bcfe09a9105f24ffe45038f50f45ca5c': getInternalUrl('dex', 'bsc', `${DEX_ROUTES.PAGE_POOLS}/factory-stable-ng-21/deposit`), //sb3pool_b
        '0x904603366bc8acf881a35cd4c7e0d514f0477ffc': getInternalUrl('dex', 'base', `${DEX_ROUTES.PAGE_POOLS}/factory-v2-1/deposit`), //s4pool_ba
        '0x795b38c85d6f1524b434f14aa37c1c808c2bbd6b': getInternalUrl('dex', 'xdai', `${DEX_ROUTES.PAGE_POOLS}/3pool/deposit`), //sx3CRV_g
      })
    }

    if (key === Pool.fantomFactoryStableNg39) {
      // prettier-ignore
      setMapper({
        '0x2dadf589f616876e21c8ba63f59af764479a422d': getInternalUrl('dex', 'ethereum', `${DEX_ROUTES.PAGE_POOLS}/factory-crvusd-16/deposit`), //s2BTC_e
        '0x636cc0ab717be347ff3acf9763afbaf7d2cf47a9': getInternalUrl('dex', 'arbitrum', `${DEX_ROUTES.PAGE_POOLS}/factory-stable-ng-69/deposit`), //s2BTC_ar
        '0x513a766f7b4269590850d566b64916d691a96927': getInternalUrl('dex', 'optimism', `${DEX_ROUTES.PAGE_POOLS}/factory-v2-63/deposit`), //s2BTC_o
      })
    }
  }, [rChainId, poolId])

  return mapper
}
