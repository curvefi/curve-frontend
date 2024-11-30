export const calculateUserPowerStale = (userVeCrv: number, userPower: number, usedVeCrv: number) => {
  const powerDecimal = userPower / 100
  const expectedVeCrv = userVeCrv * powerDecimal
  return usedVeCrv < expectedVeCrv
}
