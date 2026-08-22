import { t } from '@evm-ui/lib/i18n'
import { BrandAssetsIcon } from '@evm-ui/shared/icons/BrandAssetsIcon'
import { CrvHubIcon } from '@evm-ui/shared/icons/CrvHubIcon'
import { DiscordIcon } from '@evm-ui/shared/icons/DiscordIcon'
import { DocsIcon } from '@evm-ui/shared/icons/DocsIcon'
import { IntegrationsIcon } from '@evm-ui/shared/icons/IntegrationsIcon'
import { LAFIcon } from '@evm-ui/shared/icons/LAFIcon'
import { NewsIcon } from '@evm-ui/shared/icons/NewsIcon'
import { RiskDisclaimersIcon } from '@evm-ui/shared/icons/RiskDisclaimersIcon'
import { TelegramCNIcon } from '@evm-ui/shared/icons/TelegramCNIcon'
import { TelegramIcon } from '@evm-ui/shared/icons/TelegramIcon'
import { TelegramRUIcon } from '@evm-ui/shared/icons/TelegramRUIcon'
import { XIcon } from '@evm-ui/shared/icons/XIcon'
import { CURVE_SOCIALS, EXTERNAL_LINKS } from '@legacy-ui/utils'
import BeenhereOutlinedIcon from '@mui/icons-material/BeenhereOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import YouTubeIcon from '@mui/icons-material/YouTube'

export const getSections = () => [
  {
    title: t`Community`,
    links: [
      {
        label: t`Twitter`,
        href: CURVE_SOCIALS.twitter,
        icon: <XIcon />,
      },
      {
        label: t`Discord`,
        href: CURVE_SOCIALS.discord,
        icon: <DiscordIcon />,
      },
      {
        label: t`Youtube`,
        href: CURVE_SOCIALS.youtube.en,
        icon: <YouTubeIcon />,
      },
      {
        label: t`Announcements`,
        href: CURVE_SOCIALS.telegram.announcements,
        icon: <TelegramIcon />,
      },
      {
        label: t`Telegram`,
        href: CURVE_SOCIALS.telegram.en,
        icon: <TelegramIcon />,
      },
      {
        label: t`Telegram (CN)`,
        href: CURVE_SOCIALS.telegram.cn,
        icon: <TelegramCNIcon />,
      },
      {
        label: t`Telegram (RU)`,
        href: CURVE_SOCIALS.telegram.ru,
        icon: <TelegramRUIcon />,
      },
    ],
  },
  {
    title: t`Documentation`,
    links: [
      {
        label: t`News`,
        href: EXTERNAL_LINKS.curve.news,
        icon: <NewsIcon />,
      },
      {
        label: t`Documentation`,
        href: EXTERNAL_LINKS.curve.docs,
        icon: <DocsIcon />,
      },
      {
        label: t`Integrations`,
        // Would've loved to have used ROUTE.PAGE_INTEGRATIONS, but they differ per app.
        href: 'integrations/',
        icon: <IntegrationsIcon />,
      },
      {
        label: t`Github`,
        href: EXTERNAL_LINKS.github.curvefi,
        icon: <GitHubIcon />,
      },
      {
        label: t`Legal`,
        href: `legal/`,
        icon: <RiskDisclaimersIcon />,
      },
      {
        label: t`Brand Assets`,
        href: EXTERNAL_LINKS.brand.assets,
        icon: <BrandAssetsIcon />,
      },
    ],
  },
  {
    title: t`Security`,
    links: [
      {
        label: t`Audits`,
        href: EXTERNAL_LINKS.docs.user.security.audits,
        icon: <BeenhereOutlinedIcon />,
      },
      {
        label: t`Bug Bounty`,
        href: EXTERNAL_LINKS.docs.user.security.bugBounty,
        icon: <BugReportOutlinedIcon />,
      },
      {
        label: t`Curve Monitor`,
        href: EXTERNAL_LINKS.monitoring.curveMonitor,
        icon: <LAFIcon />,
      },
      {
        label: t`CrvHub`,
        href: EXTERNAL_LINKS.monitoring.crvHub,
        icon: <CrvHubIcon />,
      },
    ],
  },
]
