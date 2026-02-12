import { parseAbi } from 'viem'

export const ammAbi = parseAbi(['function rate() view returns (uint256)'])

export const lendControllerAbi = parseAbi([
  'function total_debt() view returns (uint256)',
  'function user_state(address) view returns (uint256,uint256,uint256,int256)',
  'function health(address,bool) view returns (int256)',
])

export const mintControllerAbi = parseAbi([
  'function user_state(address) view returns (uint256,uint256,uint256)',
  'function health(address,bool) view returns (int256)',
])

export const vaultAbi = parseAbi(['function totalAssets(address) view returns (uint256)'])
