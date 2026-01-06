import { fetchJson } from '@curvefi/prices-api/fetch'
import { CURVE_CDN_URL } from '@ui/utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { IntegrationsTags, IntegrationTag, Tag } from '../types'

const INTEGRATIONS_TAGS_URL = `${CURVE_CDN_URL}/curve-external-integrations/integrations-tags.json`

export const { useQuery: useIntegrationsTags } = queryFactory({
  queryKey: () => ['integrations-tags'] as const,
  queryFn: async () => {
    const resp = await fetchJson<IntegrationTag[]>(INTEGRATIONS_TAGS_URL)
    return parseIntegrationsTags(resp)
  },
  staleTime: '1h',
  validationSuite: EmptyValidationSuite,
})

const INTEGRATIONS_TAGS_COLORS = [
  '#F60000',
  '#FF8C00',
  '#FFEE00',
  '#4DE94C',
  '#3783FF',
  '#4815AA',
  '#EE82EE',
  '#FF69B4',
]

function parseIntegrationsTags(integrationsTags: { id: Tag; displayName: string }[]) {
  const parsedIntegrationsTags: IntegrationsTags = {}

  if (Array.isArray(integrationsTags)) {
    for (const idx in integrationsTags) {
      const t = integrationsTags[idx]
      const color = t.id === 'all' ? '' : INTEGRATIONS_TAGS_COLORS[+idx - 1]
      parsedIntegrationsTags[t.id] = { ...t, color }

      if (t.id !== 'all' && color === '') {
        console.warn(`missing integrations tag color for ${t.id}`)
      }
    }
  }

  return parsedIntegrationsTags
}
