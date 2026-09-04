import { Contract, Interface, type InterfaceAbi, JsonRpcProvider } from 'ethers'
import { useCallback, useEffect } from 'react'
import { type State, useStore } from '@/dex/store/useStore'
import { PoolData, Provider } from '@/dex/types/main.types'
import { isValidAddress } from '@/dex/utils'
import { useCurve, useWallet } from '@evm-ui/features/connect-wallet'
import { dayjs } from '@evm-ui/lib/dayjs'

type PoolTotalStaked = State['pools']['stakedMapper'][string]

export const usePoolTotalStaked = (poolData: PoolData): PoolTotalStaked | undefined => {
  const { address, lpToken, gauge } = poolData?.pool ?? {}
  const { curveApi = null } = useCurve()
  const { provider } = useWallet()
  const staked = useStore(state => state.pools.stakedMapper[address])
  const setStateByActiveKey = useStore(state => state.pools.setStateByActiveKey)

  const updateTotalStakeValue = useCallback(
    (value: { totalStakedPercent: string | number; gaugeTotalSupply: number | string }) => {
      setStateByActiveKey('stakedMapper', address, { ...value, timestamp: Date.now() })
    },
    [address, setStateByActiveKey],
  )

  const getContract = useCallback(
    async (contract: string, address: string, provider: Provider | JsonRpcProvider) => {
      try {
        const abi = await import(`@/dex/components/PagePool/abis/${contract}.json`).then(
          (module: { default: { abi: InterfaceAbi } }) => module.default.abi,
        )
        return new Contract(address, new Interface(abi).format(), provider)
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
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

    if (address && provider && shouldCallApi) {
      void (async () => {
        const gaugeContract = isValidAddress(gauge.address)
          ? await getContract('gaugeTotalSupply', gauge.address, provider)
          : null

        if (gaugeContract) {
          const poolContract =
            address === lpToken
              ? await getContract('poolTotalSupply', address, provider)
              : await getContract('lpTokenTotalSupply', lpToken, provider)

          if (poolContract) void getTotalSupply(poolContract, gaugeContract)
        } else {
          updateTotalStakeValue({ totalStakedPercent: 'N/A', gaugeTotalSupply: 'N/A' })
        }
      })()
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [curveApi?.signerAddress, curveApi?.chainId, address, provider])

  return staked
}
