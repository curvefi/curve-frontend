import type { LayerZeroBridgeFamily } from './layerzero'

export type LayerZeroCapacity =
  | { family: 'crv'; available: bigint; limit: bigint; period: bigint }
  | { family: 'stable'; limit: bigint; issued: bigint; delay: bigint }

export type LayerZeroCapacityResult = {
  delayed: bigint
  immediate: bigint
  wait: bigint
}

export const getLayerZeroCapacityResult = (
  family: LayerZeroBridgeFamily,
  amount: bigint,
  capacity: LayerZeroCapacity,
): LayerZeroCapacityResult => {
  if (family === 'crv' && capacity.family === 'crv') {
    const immediate = amount > capacity.limit ? 0n : amount < capacity.available ? amount : capacity.available
    return { immediate, delayed: amount - immediate, wait: capacity.period }
  }

  if (family === 'stable' && capacity.family === 'stable') {
    const remaining = capacity.limit > capacity.issued ? capacity.limit - capacity.issued : 0n
    const delayed = amount > remaining ? amount : 0n
    return { immediate: amount - delayed, delayed, wait: capacity.delay }
  }

  throw new Error('LayerZero capacity family mismatch')
}
