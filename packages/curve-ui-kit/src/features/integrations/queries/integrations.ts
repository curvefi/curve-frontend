import { sortBy } from 'lodash'
import { fetchJson } from '@curvefi/prices-api/fetch'
import { CURVE_CDN_URL } from '@ui/utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { Integration } from '../types'

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

export function parseIntegrationsList(integrationsList: IntegrationsResponse) {
  const parsedIntegrationsList: Integration[] = []

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

  return sortBy(parsedIntegrationsList, (a) => a.name)
}
