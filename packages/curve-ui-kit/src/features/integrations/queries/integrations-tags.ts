import { enforce, group, test } from 'vest'
import { FetchError } from '@curvefi/prices-api/fetch'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { IntegrationsTags, IntegrationTag, Tag } from '../types'

type Query = { tagsUrl: string }
type Params = FieldsOf<Query>

const tagsUrlValidationGroup = ({ tagsUrl }: Params) =>
  group('tagsUrlValidation', () => {
    test('tagsUrl', () => {
      enforce(tagsUrl).isNotEmpty().message('Tags URL is required')
    })
  })

export const { useQuery: useIntegrationsTags } = queryFactory({
  queryKey: ({ tagsUrl }: Params) => ['integrations-tags', { tagsUrl }] as const,
  queryFn: async ({ tagsUrl }: Query) => {
    const resp = await fetch(tagsUrl, { method: 'GET' })

    if (!resp.ok) {
      throw new FetchError(resp.status, `Integrations tags fetch error ${resp.status} for URL: ${tagsUrl}`)
    }

    const tags = (await resp.json()) as IntegrationTag[]
    return parseIntegrationsTags(tags)
  },
  validationSuite: createValidationSuite(tagsUrlValidationGroup),
})

function parseIntegrationsTags(integrationsTags: { id: Tag; displayName: string }[]) {
  const parsedIntegrationsTags: IntegrationsTags = {}
  const INTEGRATIONS_TAGS_COLORS = ['#F60000', '#FF8C00', '#FFEE00', '#4DE94C', '#3783FF', '#4815AA', '#ee82ee']

  if (Array.isArray(integrationsTags)) {
    for (const idx in integrationsTags) {
      const t = integrationsTags[idx]
      if (t.id !== 'crvusd') {
        const color = t.id === 'all' ? '' : INTEGRATIONS_TAGS_COLORS[+idx - 1]
        parsedIntegrationsTags[t.id] = { ...t, color }

        if (t.id !== 'all' && color === '') {
          console.warn(`missing integrations tag color for ${t.id}`)
        }
      }
    }
  }

  return parsedIntegrationsTags
}
