import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

type ScrvUsdRevenueHistory = {
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

type GetScrvUsdYieldResponse =
  | {
      count: number
      total_distributed: string
      history: ScrvUsdRevenueHistory[]
    }
  | {
      detail: {
        type: string
        loc: string[]
        msg: string
        input: string
      }[]
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

  const formattedData = {
    ...data,
    total_distributed: +data.total_distributed / 1e18,
    history: data.history.map((item) => ({
      ...item,
      gain: +item.gain / 1e18,
      loss: +item.loss / 1e18,
      current_debt: +item.current_debt / 1e18,
      total_refunds: +item.total_refunds / 1e18,
      total_fees: +item.total_fees / 1e18,
      protocol_fees: +item.protocol_fees / 1e18,
    })),
  }

  return formattedData
}

export const { useQuery: useScrvUsdRevenue } = queryFactory({
  queryKey: () => ['scrvUsdRevenue'] as const,
  queryFn: _getScrvUsdRevenue,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
