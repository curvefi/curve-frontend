import { config } from '../../lingui.config'

const mainConfig = {
  ...config,
  catalog: {
    path: 'src/locales/{locale}/messages',
    include: [
      ...['dao', 'dex', 'loan', 'lend'].flatMap((app) => [
        `src/${app}/components`,
        `src/${app}/entities`,
        `src/${app}/features`,
        `src/${app}/hooks`,
        `src/${app}/layout`,
        `src/${app}/pages`,
        `src/${app}/store`,
        `src/${app}/widgets`,
      ]),
      '../../packages/curve-ui-kit',
    ],
  },
}

export default mainConfig
