import { MAIN_ROUTE } from '@lend/constants'

export default function sitemap() {
  const BASE_URL = 'https://lend.curve.fi'
  return Object.entries(MAIN_ROUTE).map(([_, route]) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))
}
