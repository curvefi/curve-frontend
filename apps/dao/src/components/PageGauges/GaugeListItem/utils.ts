export const calculateStaleVeCrvPercentage = (usedVeCrv: number, futureVeCrv: number) => {
  return ((futureVeCrv - usedVeCrv) / usedVeCrv) * 100
}
