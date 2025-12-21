import { sortBy } from 'lodash'
import { enforce, group, test } from 'vest'
import { FetchError } from '@curvefi/prices-api/fetch'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { IntegrationApp } from '../types'

type Query = { listUrl: string }
type Params = FieldsOf<Query>

type IntegrationsResponse = {
  appUrl: string | null
  description: string
  imageId: string
  name: string
  networks: string[]
  tags: string[]
  twitterUrl: string | null
}[]

const listUrlValidationGroup = ({ listUrl }: Params) =>
  group('listUrlValidation', () => {
    test('listUrl', () => {
      enforce(listUrl).isNotEmpty().message('List URL is required')
    })
  })

export const { useQuery: useIntegrations } = queryFactory({
  queryKey: ({ listUrl }: Params) => ['integrations', { listUrl }] as const,
  queryFn: async ({ listUrl }: Query) => {
    const resp = await fetch(listUrl, { method: 'GET' })

    if (!resp.ok) {
      throw new FetchError(resp.status, `Integrations list fetch error ${resp.status} for URL: ${listUrl}`)
    }

    const integrations = (await resp.json()) as IntegrationsResponse
    return parseIntegrationsList(integrations)
  },
  validationSuite: createValidationSuite(listUrlValidationGroup),
})

// remove all non crvusd integrations
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
        if (n !== 'crvusd') {
          parsedTags[n] = true
        }
      }
      parsedIntegrationsList.push({ ...rest, networks: parsedNetworks, tags: parsedTags })
    }
  }

  return sortBy(parsedIntegrationsList, (a) => a.name)
}
