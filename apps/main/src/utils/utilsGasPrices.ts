import { weiToEther } from '@/shared/curve-lib'

export function getMaxAmountMinusGas(estimatedGas: EstimatedGas, gasCost: number, tokenBalance: string) {
  const parsedEstimatedGas = Array.isArray(estimatedGas) ? estimatedGas[0] + estimatedGas[1] : estimatedGas

  if (parsedEstimatedGas) {
    const estGasNeedInWei = parsedEstimatedGas * 1.8 * gasCost
    const estGasNeedInEther = weiToEther(estGasNeedInWei)

    const maxAmount = Number(tokenBalance) - estGasNeedInEther
    // if maxAmount is negative, it means user wallet balance is too small to cover gas cost, return 0 for now.
    return maxAmount > 0 ? maxAmount.toString() : '0'
  } else {
    return tokenBalance
  }
}
