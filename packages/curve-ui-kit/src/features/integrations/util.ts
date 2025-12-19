import { sortBy } from 'lodash'
import type { Tag, IntegrationApp, IntegrationsTags } from './types'

export function parseIntegrationsTags(integrationsTags: { id: Tag; displayName: string }[]) {
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

// remove all non crvusd integrations
export function parseIntegrationsList(
  integrationsList: {
    appUrl: string | null
    description: string
    imageId: string
    name: string
    networks: string[]
    tags: string[]
    twitterUrl: string | null
  }[],
) {
  const parsedIntegrationsList: IntegrationApp[] = []

  if (Array.isArray(integrationsList)) {
    for (const { networks, tags, ...rest } of integrationsList) {
      if (tags.indexOf('crvusd') !== -1) {
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
  }

  return sortBy(parsedIntegrationsList, (a) => a.name)
}
