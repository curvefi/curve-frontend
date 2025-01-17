import { httpFetcher } from '@/utils/helpers'
import networks from '@/networks'
import { ChainId } from '@/types/loan.types'

export type GasPrices = {
  eip1559Gas: {
    base: number
    priority: number[]
    max: number[]
    basePlusPriority: number[]
  }
  label: string[]
}

export async function fetchGasPrices(chainId: ChainId) {
  try {
    if (chainId === 1) {
      const url = networks[1].gasPricesUrl
      const gas = await httpFetcher(url)

      if (gas) {
        const { eip1559Gas } = gas.data
        const base = Math.trunc(eip1559Gas.base)
        const priority = eip1559Gas.prio.map(Math.trunc)

        return {
          eip1559Gas: {
            base,
            priority,
            max: Math.trunc(eip1559Gas.max),
            basePlusPriority: priority.map((p: number) => {
              const basePlusPriority = base + p
              if (chainId === 1) {
                return basePlusPriority
              }

              // temp hack to get reduced est gas cost for layer 2
              return basePlusPriority * 0.1
            }),
          },
          label: ['fastest', 'fast', 'medium', 'slow'],
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}
