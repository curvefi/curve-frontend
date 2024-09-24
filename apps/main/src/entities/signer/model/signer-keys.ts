import type { SignerPoolBase, SignerPoolBalances, SignerPoolDetails } from '@/entities/signer'

export const signerKeys = {
  signerBase: ({ chainId, signerAddress, poolId }: SignerPoolBase) => {
    return ['signerBase', chainId, signerAddress, poolId] as const
  },

  // query
  signerPoolBalances: ({ formType, ...params }: SignerPoolBalances) => {
    return ['signerPoolBalances', ...signerKeys.signerBase(params), formType] as const
  },
  signerPoolDetails: ({ gaugeBalance, lpTokenBalance, ...params }: SignerPoolDetails) => {
    return ['signerPoolDetails', ...signerKeys.signerBase(params), gaugeBalance, lpTokenBalance] as const
  },
}
