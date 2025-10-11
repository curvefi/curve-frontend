import { useCallback, useMemo } from 'react'
import { CROSS_CHAIN_ADDRESSES } from '@/dex/constants'
import { getUserActiveKey } from '@/dex/store/createUserSlice'
import useStore from '@/dex/store/useStore'
import type { NetworkConfig, PoolData } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { notFalsy, objectKeys, recordValues } from '@curvefi/prices-api/objects.util'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { DEX_ROUTES } from '@ui-kit/shared/routes'
import type { PoolListItem, PoolTag } from '../types'

const getPoolTags = (hasPosition: boolean, { pool: { address, id, name, referenceAsset } }: PoolData) =>
  notFalsy<PoolTag>(
    hasPosition && 'user',
    (['btc', 'crypto', 'eth', 'usd', 'kava'] as const).find((asset) => referenceAsset.toLowerCase().includes(asset)),
    id.startsWith('factory-crvusd') && 'crvusd',
    (id.startsWith('factory-tricrypto') || id.startsWith('tricrypto')) && 'tricrypto',
    id.startsWith('factory-stable-ng') && 'stableng',
    (name.startsWith('CrossCurve') || CROSS_CHAIN_ADDRESSES.includes(address)) && 'cross-chain',
    ['link', 'eur', 'xdai', 'other'].includes(referenceAsset.toLowerCase()) && 'others',
  )

export function usePoolListData({ id: network, chainId, isLite }: NetworkConfig) {
  const { curveApi } = useConnection()
  const userActiveKey = getUserActiveKey(curveApi)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[chainId])
  const rewardsApyMapper = useStore((state) => state.pools.rewardsApyMapper[chainId])
  const tvlMapper = useStore((state) => state.pools.tvlMapper[chainId])
  const userPoolList = useStore((state) => state.user.poolList[userActiveKey])
  const volumeMapper = useStore((state) => state.pools.volumeMapper[chainId])
  const fetchPoolsRewardsApy = useStore((state) => state.pools.fetchPoolsRewardsApy)
  const poolsData = useMemo(() => poolDataMapper && recordValues(poolDataMapper), [poolDataMapper])

  usePageVisibleInterval(
    useCallback(() => {
      if (curveApi && rewardsApyMapper && Object.keys(rewardsApyMapper).length > 0) {
        void fetchPoolsRewardsApy(chainId, poolsData)
      }
    }, [curveApi, fetchPoolsRewardsApy, poolsData, chainId, rewardsApyMapper]),
    REFRESH_INTERVAL['11m'],
    isPageVisible,
  )

  return {
    isReady: !!useMemo(
      () => objectKeys(tvlMapper ?? {}).length && (!isLite || objectKeys(volumeMapper || {}).length),
      [isLite, tvlMapper, volumeMapper],
    ),
    userHasPositions: useMemo(() => userPoolList && recordValues(userPoolList).some(Boolean), [userPoolList]),
    data: useMemo(
      () =>
        poolsData &&
        poolsData.map(
          (item): PoolListItem => ({
            ...item,
            rewards: rewardsApyMapper?.[item.pool.id] ?? {},
            volume: volumeMapper?.[item.pool.id] ?? {},
            tvl: tvlMapper?.[item.pool.id] ?? {},
            hasPosition: userPoolList?.[item.pool.id],
            network,
            url: getPath({ network }, `${DEX_ROUTES.PAGE_POOLS}/${item.pool.id}/deposit`),
            tags: getPoolTags(userPoolList?.[item.pool.id], item),
          }),
        ),
      [poolsData, rewardsApyMapper, tvlMapper, userPoolList, volumeMapper, network],
    ),
  }
}
