import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

type ScrvUsdRevenueHistoryFromApi = {
  strategy: string
  gain: string
  loss: string
  current_debt: string
  total_refunds: string
  total_fees: string
  protocol_fees: string
  tx_hash: string
  dt: string
}

type ScrvUsdRevenueHistory = {
  strategy: string
  gain: number
  loss: number
  current_debt: number
  total_refunds: number
  total_fees: number
  protocol_fees: number
  tx_hash: string
  dt: string
}

type GetScrvUsdYieldResponse =
  | {
      count: number
      total_distributed: string
      history: ScrvUsdRevenueHistoryFromApi[]
    }
  | {
      detail: {
        type: string
        loc: string[]
        msg: string
        input: string
      }[]
    }

type Epoch = {
  startDate: string
  endDate: string
  weeklyRevenue: number
  data: ScrvUsdRevenueHistory[]
}

export type ScrvUsdRevenue = {
  count: number
  total_distributed: number
  epochs: Epoch[]
  history: ScrvUsdRevenueHistory[]
}

/**
 * Separate the revenue in epochs (to display bars containing up to 7 days each)
 */
const organizeDataIntoEpochs = (history: ScrvUsdRevenueHistory[]): Epoch[] => {
  // Sort history by date
  const sortedHistory = [...history].sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime())

  const epochs: Epoch[] = []
  let currentEpoch: Epoch | null = null

  sortedHistory.forEach((item) => {
    const itemDate = new Date(item.dt)

    // If we don't have a current epoch or the item doesn't belong to current epoch
    if (!currentEpoch || itemDate > new Date(currentEpoch.endDate)) {
      // Find the previous Thursday if item is not on Thursday
      const startDate = new Date(itemDate)
      while (startDate.getDay() !== 4) {
        // 4 represents Thursday
        startDate.setDate(startDate.getDate() - 1)
      }

      // Set end date to next Thursday
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 7)

      currentEpoch = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        weeklyRevenue: 0,
        data: [],
      }
      epochs.push(currentEpoch)
    }

    currentEpoch.data.push(item)
    // Add to weekly revenue (gain - loss)
    currentEpoch.weeklyRevenue += +item.gain - +item.loss
  })

  return epochs
}

export const _getScrvUsdRevenue = async () => {
  const pages = 1
  const dataPerPage = 300

  const url = `https://prices.curve.fi/v1/crvusd/savings/revenue?page=${pages}&per_page=${dataPerPage}`
  const response = await fetch(url)

  const data = (await response.json()) as GetScrvUsdYieldResponse

  // detail is returned from API when there is an error
  if ('detail' in data) {
    throw new Error(`Failed to fetch scrvUSD historical revenue data. ${data.detail[0].msg}`)
  }

  const history = data.history.map((item) => ({
    ...item,
    gain: +item.gain / 1e18,
    loss: +item.loss / 1e18,
    current_debt: +item.current_debt / 1e18,
    total_refunds: +item.total_refunds / 1e18,
    total_fees: +item.total_fees / 1e18,
    protocol_fees: +item.protocol_fees / 1e18,
  }))

  const formattedData = {
    ...data,
    total_distributed: +data.total_distributed / 1e18,
    epochs: organizeDataIntoEpochs(history),
    history,
  }

  return formattedData
}

export const { useQuery: useScrvUsdRevenue } = queryFactory({
  queryKey: () => ['scrvUsdRevenue'] as const,
  queryFn: _getScrvUsdRevenue,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
