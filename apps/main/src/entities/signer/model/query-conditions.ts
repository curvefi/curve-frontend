import type { SignerPoolBalances, SignerPoolDetails } from '@/entities/signer'

import { isAddress } from 'viem'

export function enableSignerPoolBase({ chainId, signerAddress = '', poolId }: SignerPoolBalances) {
  return !!chainId && !!poolId && isAddress(signerAddress)
}

export function enableSignerPoolDetails({ gaugeBalance, lpTokenBalance, ...params }: SignerPoolDetails) {
  return enableSignerPoolBase(params) && (Number(gaugeBalance) > 0 || Number(lpTokenBalance) > 0)
}
