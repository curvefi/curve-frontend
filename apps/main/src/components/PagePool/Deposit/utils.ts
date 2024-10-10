import { weiToEther } from '@/shared/curve-lib'

export function calcNewCrvApr(crvApr: number, lpToken: string, gaugeTotalSupply: string | number) {
  if (!crvApr && !gaugeTotalSupply && Number(gaugeTotalSupply) === 0 && Number(lpToken) === 0) return null

  const gaugeTotalSupplyInEther = weiToEther(Number(gaugeTotalSupply))
  const newGaugeTotalLocked = Number(lpToken) + gaugeTotalSupplyInEther
  const newCrvApr = (gaugeTotalSupplyInEther / newGaugeTotalLocked) * crvApr
  return { ratio: crvApr / newCrvApr, apr: newCrvApr }
}
