import BeenhereOutlinedIcon from '@mui/icons-material/BeenhereOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { CURVE_SOCIALS, EXTERNAL_LINKS } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { BrandAssetsIcon } from '@ui-kit/shared/icons/BrandAssetsIcon'
import { CrvHubIcon } from '@ui-kit/shared/icons/CrvHubIcon'
import { DiscordIcon } from '@ui-kit/shared/icons/DiscordIcon'
import { DocsIcon } from '@ui-kit/shared/icons/DocsIcon'
import { DuneIcon } from '@ui-kit/shared/icons/DuneIcon'
import { IntegrationsIcon } from '@ui-kit/shared/icons/IntegrationsIcon'
import { LAFIcon } from '@ui-kit/shared/icons/LAFIcon'
import { NewsIcon } from '@ui-kit/shared/icons/NewsIcon'
import { RiskDisclaimersIcon } from '@ui-kit/shared/icons/RiskDisclaimersIcon'
import { TelegramCNIcon } from '@ui-kit/shared/icons/TelegramCNIcon'
import { TelegramIcon } from '@ui-kit/shared/icons/TelegramIcon'
import { TelegramRUIcon } from '@ui-kit/shared/icons/TelegramRUIcon'
import { XIcon } from '@ui-kit/shared/icons/XIcon'

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
        href: EXTERNAL_LINKS.security.curveMonitor,
        icon: <LAFIcon />,
      },
      {
        label: t`CrvHub`,
        href: EXTERNAL_LINKS.security.crvHub,
        icon: <CrvHubIcon />,
      },
      {
        label: t`Dune Analytics`,
        href: EXTERNAL_LINKS.analytics.duneCurveFi,
        icon: <DuneIcon />,
      },
      {
        label: t`API Status`,
        href: EXTERNAL_LINKS.security.apiStatus,
        icon: <MonitorHeartOutlinedIcon />,
      },
    ],
  },
]
