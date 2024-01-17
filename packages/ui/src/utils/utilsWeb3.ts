export function gweiToWai(gwei: number) {
  return Math.trunc(gwei * 1e9)
}

export function weiToGwei(wai: number) {
  return Math.trunc(wai) / 1e9
}

export function gweiToEther(gwei: number) {
  return gwei / 1e9
}

export function weiToEther(wei: number) {
  return wei / 1e18
}
