import { Contract, Interface, JsonRpcProvider } from 'ethers'
import { useCallback, useEffect } from 'react'
import { isValidAddress } from '@/utils'
import useStore from '@/store/useStore'
import dayjs from '@/lib/dayjs'

const usePoolTotalStaked = (poolDataCacheOrApi: PoolDataCacheOrApi) => {
  const { address, lpToken, gauge } = poolDataCacheOrApi?.pool ?? {}

  const curve = useStore((state) => state.curve)
  const getProvider = useStore((state) => state.wallet.getProvider)
  const staked = useStore((state) => state.pools.stakedMapper[address])
  const setStateByActiveKey = useStore((state) => state.pools.setStateByActiveKey)
  const { rpcUrl } = useStore((state) => curve && state.networks.networks[curve.chainId]) ?? {}

  const updateTotalStakeValue = useCallback(
    (value: { totalStakedPercent: string | number; gaugeTotalSupply: number | string }) => {
      setStateByActiveKey('stakedMapper', address, { ...value, timestamp: Date.now() })
    },
    [address, setStateByActiveKey],
  )

  const getContract = useCallback(
    async (contract: string, address: string, provider: Provider | JsonRpcProvider) => {
      try {
        const abi = await import(`@/components/PagePool/abis/${contract}.json`).then((module) => module.default.abi)
        const iface = new Interface(abi)
        return new Contract(address, iface.format(), provider)
      } catch (error) {
        updateTotalStakeValue({ totalStakedPercent: 'N/A', gaugeTotalSupply: 'N/A' })
        console.error(error)
      }
    },
    [updateTotalStakeValue],
  )

  const getTotalSupply = useCallback(
    async (poolContract: Contract, gaugeContract: Contract) => {
      try {
        const [lpTokenTotalSupply, gaugeTotalSupply] = await Promise.all([
          poolContract.totalSupply(),
          gaugeContract.totalSupply(),
        ])

        const isZero = Number(lpTokenTotalSupply) === 0 && Number(gaugeTotalSupply) === 0
        const totalStakedPercent = isZero ? 0 : (Number(gaugeTotalSupply) / Number(lpTokenTotalSupply)) * 100
        updateTotalStakeValue({ totalStakedPercent, gaugeTotalSupply: Number(gaugeTotalSupply) })
      } catch (error) {
        updateTotalStakeValue({ totalStakedPercent: 'N/A', gaugeTotalSupply: 'N/A' })
        console.error(error)
      }
    },
    [updateTotalStakeValue],
  )

  useEffect(() => {
    const shouldCallApi = staked?.timestamp ? dayjs().diff(staked.timestamp, 'seconds') > 30 : true

    if (address && rpcUrl && shouldCallApi) {
      ;(async () => {
        const provider = getProvider('') || new JsonRpcProvider(rpcUrl)
        const gaugeContract = isValidAddress(gauge.address)
          ? await getContract('gaugeTotalSupply', gauge.address, provider)
          : null

        if (gaugeContract) {
          const poolContract =
            address === lpToken
              ? await getContract('poolTotalSupply', address, provider)
              : await getContract('lpTokenTotalSupply', lpToken, provider)

          if (poolContract) getTotalSupply(poolContract, gaugeContract)
        } else {
          updateTotalStakeValue({ totalStakedPercent: 'N/A', gaugeTotalSupply: 'N/A' })
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.signerAddress, curve?.chainId, address, rpcUrl])

  return staked
}

export default usePoolTotalStaked
