import { APP_LINK, getInternalUrl } from 'curve-ui-kit/src/shared/routes'

export default function sitemap() {
  return Object.entries(APP_LINK).flatMap(([app, { routes }]) =>
    routes.map((page) => ({
      url: getInternalUrl(app, 'ethereum', page.route),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  )
}
