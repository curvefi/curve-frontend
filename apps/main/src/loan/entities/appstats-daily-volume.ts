import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

async function _fetchAppDailyVolume(): Promise<number> {
  const resp = await fetch('https://api.curve.fi/api/getVolumes/ethereum/crvusd-amms')
  const { data } = await resp.json()
  return data.totalVolume
}

export const {
  useQuery: useAppStatsDailyVolume,
  setQueryData: setAppStatsDailyVolume,
  fetchQuery: fetchAppStatsDailyVolume,
} = queryFactory({
  queryKey: () => ['appStatsDailyVolume'] as const,
  queryFn: _fetchAppDailyVolume,
  validationSuite: EmptyValidationSuite,
})
