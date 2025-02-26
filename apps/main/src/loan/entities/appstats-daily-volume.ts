import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { httpFetcher } from '@/loan/utils/helpers'

async function _fetchAppDailyVolume() {
  const resp = await httpFetcher('https://api.curve.fi/api/getVolumes/ethereum/crvusd-amms')
  return resp.data.totalVolume ?? 'NaN'
}

export const { useQuery: useAppStatsDailyVolume } = queryFactory({
  queryKey: () => ['appStatsDailyVolume'] as const,
  queryFn: _fetchAppDailyVolume,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
