import { sortBy } from 'lodash'
import type { Partner } from '@evm-ui/shared/ui/PartnerCard'
import { fetchJson } from '@primitives/fetch.utils'
import { fromEntries } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { CURVE_CDN_URL } from '@ui/lib/resource.constants'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'

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
