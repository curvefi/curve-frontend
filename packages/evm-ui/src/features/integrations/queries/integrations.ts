import { sortBy } from 'lodash'
import { EmptyValidationSuite } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model/query'
import type { Partner } from '@evm-ui/shared/ui/PartnerCard'
import { CURVE_CDN_URL } from '@legacy-ui/utils'
import { fetchJson } from '@primitives/fetch.utils'
import { fromEntries } from '@primitives/objects.utils'

const INTEGRATIONS_URL = `${CURVE_CDN_URL}/curve-external-integrations/integrations-list.json`

type IntegrationsResponse = {
  appUrl: string | null
  description: string
  imageId: string
  name: string
  networks: string[]
  tags: string[]
  twitterUrl: string | null
}[]

export const { useQuery: useIntegrations } = queryFactory({
  queryKey: () => ['integrations'] as const,
  queryFn: async () => {
    const resp = await fetchJson<IntegrationsResponse>(INTEGRATIONS_URL)
    return parseIntegrationsList(resp)
  },
  validationSuite: EmptyValidationSuite,
  category: 'global.integrations',
})

const parseIntegrationsList = (integrationsList: IntegrationsResponse) =>
  sortBy(integrationsList, i => i.name).map((app): Partner => ({
    name: app.name,
    description: app.description,
    imageId: `platforms/${app.imageId}`,
    networks: fromEntries(app.networks.map(n => [n, true])),
    tags: app.tags,
    appUrl: app.appUrl ?? undefined,
    twitterUrl: app.twitterUrl ?? undefined,
  }))
