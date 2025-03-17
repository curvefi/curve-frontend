import { httpFetcher } from '@/loan/utils/helpers'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

async function _fetchAppDailyVolume() {
  const resp = await httpFetcher('https://api.curve.fi/api/getVolumes/ethereum/crvusd-amms')
  return resp.data.totalVolume ?? 'NaN'
}

export const { useQuery: useAppStatsDailyVolume } = queryFactory({
  queryKey: () => ['appStatsDailyVolume'] as const,
  queryFn: _fetchAppDailyVolume,
  validationSuite: EmptyValidationSuite,
})
