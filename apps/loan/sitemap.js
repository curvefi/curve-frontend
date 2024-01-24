import { MAIN_ROUTE } from '@/constants'

export default function sitemap() {
  const BASE_URL = 'https://crvusd.curve.fi'
  return Object.entries(MAIN_ROUTE).map(([_, route]) => {
    return {
      url: `${BASE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  })
}
