export const calculateStaleVeCrvPercentage = (usedVeCrv: number, futureVeCrv: number) => ((futureVeCrv - usedVeCrv) / usedVeCrv) * 100
