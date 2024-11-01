import { SidebarSection } from './SidebarSection'
import { t } from '@lingui/macro'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'
import TelegramIcon from '@mui/icons-material/Telegram'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'
import Tooltip from '@mui/material/Tooltip'
import Link from '@mui/material/Link'
import { DiscordIcon } from 'curve-ui-kit/src/shared/ui/DiscordIcon'
import { Box } from 'curve-ui-kit/src/shared/ui/Box'
import SvgIcon from '@mui/material/SvgIcon';

type SocialButtonProps = {
  label: string,
  href: string,
  icon: typeof SvgIcon
}

const SocialButton = ({ icon: Icon, href, label }: SocialButtonProps) => (
  <IconButton component={Link} href={href} target="_blank" rel="noopener noreferrer">
    <Tooltip title={label}>
      <Icon fontSize="large" color="primary" />
    </Tooltip>
  </IconButton>
)

type SocialSidebarSectionProps = { currentPath: string }

export const SocialSidebarSection = (props: SocialSidebarSectionProps) => (
  <SidebarSection title={t`Socials`} currentPath={props.currentPath}>
    <Box display="flex" justifyContent="space-around">
      <SocialButton label="Discord" href="https://discord.gg/rgrfS7W" icon={DiscordIcon} />
      <SocialButton label="Telegram" href="https://t.me/curvefi" icon={TelegramIcon} />
      <SocialButton label="Twitter" href="https://x.com/curvefinance" icon={TwitterIcon} />
      <SocialButton label="YouTube" href="https://www.youtube.com/@CurveFinanceChannel" icon={YouTubeIcon} />
    </Box>
  </SidebarSection>
)
