import { weiToGwei } from 'curve-ui-kit/src/utils'

export function getEthereumCustomFeeDataValues(gasInfo: { max: number[]; prio: number[] } | undefined) {
  if (gasInfo) {
    const maxFeePerGas = gasInfo.max[1] ? weiToGwei(gasInfo.max[1]) : null
    const maxPriorityFeePerGas = gasInfo.prio[1] ? weiToGwei(gasInfo.prio[1]) : null
    if (maxFeePerGas && maxPriorityFeePerGas) {
      return { maxFeePerGas, maxPriorityFeePerGas }
    }
  }
  return null
}
