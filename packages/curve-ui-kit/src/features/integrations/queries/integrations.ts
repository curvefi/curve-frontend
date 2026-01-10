import { sortBy } from 'lodash'
import { fetchJson } from '@curvefi/prices-api/fetch'
import { fromEntries } from '@curvefi/prices-api/objects.util'
import { CURVE_CDN_URL } from '@ui/utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { Partner } from '@ui-kit/shared/ui/PartnerCard'

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
  staleTime: '1h',
  validationSuite: EmptyValidationSuite,
})

export const parseIntegrationsList = (integrationsList: IntegrationsResponse) =>
  sortBy(integrationsList, (i) => i.name).map(
    (app): Partner => ({
      name: app.name,
      description: app.description,
      imageId: `platforms/${app.imageId}`,
      networks: fromEntries(app.networks.map((n) => [n, true])),
      tags: app.tags,
      appUrl: app.appUrl ?? undefined,
      twitterUrl: app.twitterUrl ?? undefined,
    }),
  )
