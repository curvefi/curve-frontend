import { fetchJson } from '@primitives/fetch.utils'
import { fromEntries } from '@primitives/objects.utils'
import { CURVE_CDN_URL } from '@ui/utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

const INTEGRATIONS_TAGS_URL = `${CURVE_CDN_URL}/curve-external-integrations/integrations-tags.json`

type IntegrationTag = { id: string; displayName: string; color: string }

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

const parseIntegrationsTags = (
  integrationsTags: { id: string; displayName: string }[],
): {
  [k: string]: IntegrationTag
} =>
  fromEntries(
    integrationsTags.map((t, idx) => {
      if (t.id === 'all') return ['all', { ...t, color: '' }]
      const color = INTEGRATIONS_TAGS_COLORS[+idx - 1] ?? ''
      if (!color) console.warn(`missing integrations tag color for ${t.id}`)
      return [t.id, { ...t, color }]
    }),
  )
