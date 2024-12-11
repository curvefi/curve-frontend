import { t } from '@lingui/macro'

import YouTubeIcon from '@mui/icons-material/YouTube'
import TelegramIcon from '@mui/icons-material/Telegram'
import NewspaperIcon from '@mui/icons-material/Newspaper'
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined'
import BookIcon from '@mui/icons-material/Book'
import GitHubIcon from '@mui/icons-material/GitHub'
import BeenhereOutlinedIcon from '@mui/icons-material/BeenhereOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'

import { XIcon } from 'curve-ui-kit/src/shared/icons/XIcon'
import { DiscordIcon } from 'curve-ui-kit/src/shared/icons/DiscordIcon'
import { LAFIcon } from 'curve-ui-kit/src/shared/icons/LAFIcon'
import { DuneIcon } from 'curve-ui-kit/src/shared/icons/DuneIcon'
import { CrvHubIcon } from 'curve-ui-kit/src/shared/icons/CrvHubIcon'
import { SectionProps } from './Section'

export const getSections = (): SectionProps[] => [
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
        href: 'https://t.me/curvefi',
        icon: <TelegramIcon />,
      },
      {
        label: t`Telegram`,
        href: 'https://t.me/crvtraders',
        icon: <TelegramIcon />,
      },
      {
        label: t`Telegram (CN)`,
        href: 'https://t.me/curveficn',
        icon: <TelegramIcon />,
      },
      {
        label: t`Telegram (RU)`,
        href: 'https://t.me/crvrussianchat',
        icon: <TelegramIcon />,
      },
    ],
  },
  {
    title: t`Documentation`,
    links: [
      {
        label: t`News`,
        href: 'https://news.curve.fi/',
        icon: <NewspaperIcon />,
      },
      {
        label: t`User Docs`,
        href: 'https://resources.curve.fi/',
        icon: <BookIcon />,
      },
      {
        label: t`Integrations`,
        href: 'https://docs.curve.fi/integration/overview/',
        icon: <IntegrationInstructionsOutlinedIcon />,
      },
      {
        label: t`Technical Docs`,
        href: 'https://docs.curve.fi/',
        icon: <BookIcon />,
      },
      {
        label: t`Github`,
        href: 'https://github.com/curvefi',
        icon: <GitHubIcon />,
      },
    ],
  },
  {
    title: t`Security`,
    links: [
      {
        label: t`Audits`,
        href: 'https://docs.curve.fi/references/audits/',
        icon: <BeenhereOutlinedIcon />,
      },
      {
        label: t`Bug Bounty`,
        href: 'https://docs.curve.fi/security/security/',
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
    ],
  },
]
