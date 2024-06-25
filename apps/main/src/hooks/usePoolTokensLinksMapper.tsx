import { useEffect, useState } from 'react'

enum Pool {
  fantomFactoryStableNg24 = `250-factory-stable-ng-24`,
}

const BASE_URL = 'https://curve.fi/#/'

// Custom link for each token in a pool.
const usePoolTokensLinksMapper = (rChainId: ChainId, { pool }: PoolDataCacheOrApi) => {
  const poolId = pool?.id

  const [mapper, setMapper] = useState<{ [tokenAddress: string]: string } | null>(null)

  useEffect(() => {
    if (!rChainId && !poolId) return

    const key = `${rChainId}-${poolId}`

    if (key === Pool.fantomFactoryStableNg24) {
      setMapper({
        '0x14f8e5851879a18e0fea77b5a17f15523262a99e': `${BASE_URL}ethereum/pools/3pool/deposit`, //s3Crv_e
        '0x2902257ba817e1436b93f9f959ed50b95560b7d5': `${BASE_URL}arbitrum/pools/2pool/deposit`, //s2CRV_ar
        '0x740568006c07888216649632aace6620288c7078': `${BASE_URL}optimism/pools/3pool/deposit`, //s3CRV_o
        '0x9be1ae6175b106f26439cebaf2217d7815f684af': `${BASE_URL}avalanche/pools/aave/deposit`, //sav3CRV_av
        '0x4636a4efba1c02917d0584505e47bb2d22afe359': `${BASE_URL}polygon/pools/aave/deposit`, //sam3CRV_p
        '0xab72e7f7bcfe09a9105f24ffe45038f50f45ca5c': `${BASE_URL}bsc/pools/factory-stable-ng-21/deposit`, //sb3pool_b
        '0x904603366bc8acf881a35cd4c7e0d514f0477ffc': `${BASE_URL}base/pools/factory-v2-1/deposit`, //s4pool_ba
        '0x795b38c85d6f1524b434f14aa37c1c808c2bbd6b': `${BASE_URL}xdai/pools/3pool/deposit`, //sx3CRV_g
      })
    }
  }, [rChainId, poolId])

  return mapper
}

export default usePoolTokensLinksMapper
