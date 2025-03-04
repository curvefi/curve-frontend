import { APP_LINK } from 'curve-ui-kit/src/shared/routes'

export default function sitemap() {
  return Object.entries(APP_LINK).flatMap(([app, { pages }]) =>
    pages.map((page) => ({
      url: `${APP_LINK[app].root}${page.route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  )
}
