import { QueryFunction } from '@tanstack/react-query'
import { ChainQueryKeyType } from '@/entities/chain'
import { assertChainValidity } from '@/entities/chain/lib/validation'
import { logQuery } from '@/shared/lib/logging'
import { Contract } from 'ethers'
import { CRVUSD_ADDRESS } from 'loan/src/constants'
import useStore from '@/store/useStore'
import { BD } from '@/shared/curve-lib'


const TOTAL_SUPPLY_INTERFACE = ["function totalSupply() view returns (uint256)"];
const SCALE = BD.from(10).pow(18)

export const queryTotalCrvUsd: QueryFunction<
  string,
  ChainQueryKeyType<'root'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId] = queryKey
  assertChainValidity({ chainId })

  const { provider } = useStore.getState().wallet
  const contract = new Contract(CRVUSD_ADDRESS, TOTAL_SUPPLY_INTERFACE, provider)
  const supply = await contract.totalSupply()
  return BD.from(supply).div(SCALE).toString()
}
