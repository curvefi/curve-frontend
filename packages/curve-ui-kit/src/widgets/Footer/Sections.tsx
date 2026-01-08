import BeenhereOutlinedIcon from '@mui/icons-material/BeenhereOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import YouTubeIcon from '@mui/icons-material/YouTube'
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
        href: 'https://twitter.com/curvefinance',
        icon: <XIcon />,
      },
      {
        label: t`Discord`,
        href: 'https://discord.gg/rgrfS7W',
        icon: <DiscordIcon />,
      },
      {
        label: t`Youtube`,
        href: 'https://www.youtube.com/c/CurveFinance',
        icon: <YouTubeIcon />,
      },
      {
        label: t`Announcements`,
        href: 'https://t.me/curvefiann',
        icon: <TelegramIcon />,
      },
      {
        label: t`Telegram`,
        href: 'https://t.me/curvefi',
        icon: <TelegramIcon />,
      },
      {
        label: t`Telegram (CN)`,
        href: 'https://t.me/curveficn',
        icon: <TelegramCNIcon />,
      },
      {
        label: t`Telegram (RU)`,
        href: 'https://t.me/crvrussianchat',
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
        label: t`User Docs`,
        href: 'https://resources.curve.finance/',
        icon: <HelpOutlineIcon />,
      },
      {
        label: t`Integrations`,
        // Would've loved to have used ROUTE.PAGE_INTEGRATIONS, but they differ per app.
        href: 'integrations/',
        icon: <IntegrationsIcon />,
      },
      {
        label: t`Technical Docs`,
        href: 'https://docs.curve.finance/',
        icon: <DocsIcon />,
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
        href: 'https://docs.curve.finance/security/security/#security-audits',
        icon: <BeenhereOutlinedIcon />,
      },
      {
        label: t`Bug Bounty`,
        href: 'https://docs.curve.finance/security/security/#bug-bounty',
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
