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

export const sections: SectionProps[] = [
  {
    title: 'Community',
    links: [
      {
        label: 'Twitter',
        href: 'https://twitter.com/curvefinance',
        icon: <XIcon />,
      },
      {
        label: 'Discord',
        href: 'https://discord.gg/rgrfS7W',
        icon: <DiscordIcon />,
      },
      {
        label: 'Youtube',
        href: 'https://www.youtube.com/c/CurveFinance',
        icon: <YouTubeIcon />,
      },
      {
        label: 'Announcements',
        href: 'https://t.me/curvefi',
        icon: <TelegramIcon />,
      },
      {
        label: 'Telegram',
        href: 'https://t.me/crvtraders',
        icon: <TelegramIcon />,
      },
      {
        label: 'Telegram (CN)',
        href: 'https://t.me/curveficn',
        icon: <TelegramIcon />,
      },
      {
        label: 'Telegram (RU)',
        href: 'https://t.me/crvrussianchat',
        icon: <TelegramIcon />,
      },
    ],
  },
  {
    title: 'Documentation',
    links: [
      {
        label: 'News',
        href: 'https://news.curve.fi/',
        icon: <NewspaperIcon />,
      },
      {
        label: 'Integrations',
        href: 'https://docs.curve.fi/integration/overview/',
        icon: <IntegrationInstructionsOutlinedIcon />,
      },
      {
        label: 'User Docs',
        href: 'https://resources.curve.fi/',
        icon: <BookIcon />,
      },
      {
        label: 'Technical Docs',
        href: 'https://docs.curve.fi/',
        icon: <BookIcon />,
      },
      {
        label: 'Github',
        href: 'https://github.com/curvefi',
        icon: <GitHubIcon />,
      },
    ],
  },
  {
    title: 'Security',
    links: [
      {
        label: 'Audits',
        href: 'https://docs.curve.fi/references/audits/',
        icon: <BeenhereOutlinedIcon />,
      },
      {
        label: 'Bug Bounty',
        href: 'https://docs.curve.fi/security/security/',
        icon: <BugReportOutlinedIcon />,
      },
      {
        label: 'Curve Monitor',
        href: 'https://curvemonitor.com/',
        icon: <LAFIcon />,
      },
      {
        label: 'CrvHub',
        href: 'https://crvhub.com/',
        icon: <CrvHubIcon />,
      },
      {
        label: 'Dune Analytics',
        href: 'https://dune.com/mrblock_buidl/Curve.fi',
        icon: <DuneIcon />,
      },
    ],
  },
]
