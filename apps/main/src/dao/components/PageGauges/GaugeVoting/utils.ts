export const calculateUserPowerStale = (userVeCrv: number, powerUsed: number, usedVeCrv: number) => {
  const threshold = 1.005 // 0.5% buffer

  const powerDecimal = powerUsed / 100
  const expectedVeCrv = userVeCrv * powerDecimal

  return usedVeCrv * threshold < expectedVeCrv
}
