export type LayerZeroCapacity =
  { family: 'crv'; available: bigint } | { family: 'stable'; limit: bigint; issued: bigint }

export const getLayerZeroCapacityAvailable = (capacity: LayerZeroCapacity) =>
  capacity.family === 'crv'
    ? capacity.available
    : capacity.limit > capacity.issued
      ? capacity.limit - capacity.issued
      : 0n

export const isLayerZeroCapacityExceeded = (amount: bigint, capacityAvailable: bigint) => amount > capacityAvailable
