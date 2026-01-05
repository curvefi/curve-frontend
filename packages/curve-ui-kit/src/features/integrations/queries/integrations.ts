import { sortBy } from 'lodash'
import { FetchError } from '@curvefi/prices-api/fetch'
import { CURVE_CDN_URL } from '@ui/utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { IntegrationApp } from '../types'

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
    const resp = await fetch(INTEGRATIONS_URL, { method: 'GET' })

    if (!resp.ok) {
      throw new FetchError(resp.status, `Integrations list fetch error ${resp.status} for URL: ${INTEGRATIONS_URL}`)
    }

    const integrations = (await resp.json()) as IntegrationsResponse
    return parseIntegrationsList(integrations)
  },
  validationSuite: EmptyValidationSuite,
})

export function parseIntegrationsList(integrationsList: IntegrationsResponse) {
  const parsedIntegrationsList: IntegrationApp[] = []

  if (Array.isArray(integrationsList)) {
    for (const { networks, tags, ...rest } of integrationsList) {
      const parsedNetworks: { [network: string]: boolean } = {}
      for (const n of networks) {
        parsedNetworks[n] = true
      }
      const parsedTags: { [tag: string]: boolean } = {}
      for (const n of tags) {
        parsedTags[n] = true
      }
      parsedIntegrationsList.push({ ...rest, networks: parsedNetworks, tags: parsedTags })
    }
  }

  return sortBy(parsedIntegrationsList, (a) => a.name)
}
