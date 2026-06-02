import BeenhereOutlinedIcon from '@mui/icons-material/BeenhereOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { CURVE_SOCIALS } from '@ui/utils'
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
        href: 'https://news.curve.finance/',
        icon: <NewsIcon />,
      },
      {
        label: t`Documentation`,
        href: 'https://docs.curve.finance/',
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
        href: 'https://github.com/curvefi',
        icon: <GitHubIcon />,
      },
      {
        label: t`Legal`,
        href: `legal/`,
        icon: <RiskDisclaimersIcon />,
      },
      {
        label: t`Brand Assets`,
        href: 'https://curvefinance.notion.site/Brand-Assets-1a6599aae064802fba11ce6a9e642d74',
        icon: <BrandAssetsIcon />,
      },
    ],
  },
  {
    title: t`Security`,
    links: [
      {
        label: t`Audits`,
        href: 'https://docs.curve.finance/user/security/audits',
        icon: <BeenhereOutlinedIcon />,
      },
      {
        label: t`Bug Bounty`,
        href: 'https://docs.curve.finance/user/security/bug-bounty',
        icon: <BugReportOutlinedIcon />,
      },
      {
        label: t`Curve Monitor`,
        href: 'https://curvemonitor.com/',
        icon: <LAFIcon />,
      },
      {
        label: t`CrvHub`,
        href: 'https://crvhub.com/',
        icon: <CrvHubIcon />,
      },
      {
        label: t`Dune Analytics`,
        href: 'https://dune.com/mrblock_buidl/Curve.fi',
        icon: <DuneIcon />,
      },
      {
        label: t`API Status`,
        href: 'https://statuspage.freshping.io/59335-CurveAPI',
        icon: <MonitorHeartOutlinedIcon />,
      },
    ],
  },
]
