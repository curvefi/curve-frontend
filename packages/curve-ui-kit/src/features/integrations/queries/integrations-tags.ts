import { fetchJson } from '@curvefi/prices-api/fetch'
import { fromEntries } from '@curvefi/prices-api/objects.util'
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

const parseIntegrationsTags = (integrationsTags: { id: Tag; displayName: string }[]): IntegrationsTags =>
  fromEntries(
    integrationsTags.map((t, idx) => {
      if (t.id === 'all') return ['all', { ...t, color: '' }]
      const color = INTEGRATIONS_TAGS_COLORS[+idx - 1] ?? ''
      if (!color) console.warn(`missing integrations tag color for ${t.id}`)
      return [t.id, { ...t, color }]
    }),
  )
