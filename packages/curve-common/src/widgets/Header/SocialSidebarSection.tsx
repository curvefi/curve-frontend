import { SidebarSection } from './SidebarSection'
import IconButton from '@mui/material/IconButton'
import TelegramIcon from '@mui/icons-material/Telegram'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'
import Tooltip from '@mui/material/Tooltip'
import Link from '@mui/material/Link'
import { DiscordIcon } from 'curve-ui-kit/src/shared/icons/DiscordIcon'
import { DodoIcon } from 'curve-ui-kit/src/shared/icons/DodoIcon'
import Box from '@mui/material/Box'
import SvgIcon from '@mui/material/SvgIcon'
import type { Locale } from 'curve-common/src/widgets/Header/types'

type SocialButtonProps = {
  label: string,
  href: string,
  icon: typeof SvgIcon
}

const SocialButton = ({ icon: Icon, href, label }: SocialButtonProps) => (
  <IconButton component={Link} href={href} target="_blank" rel="noopener noreferrer" size="small">
    <Tooltip title={label}>
      <Icon fontSize="large" color="primary" />
    </Tooltip>
  </IconButton>
)

type SocialSidebarSectionProps = { title: string, locale: Locale }

export const SocialSidebarSection = ({ title, locale }: SocialSidebarSectionProps) => (
  <SidebarSection title={title}>
    <Box display="flex" justifyContent="space-around">
      <SocialButton label="Discord" href="https://discord.gg/rgrfS7W" icon={DiscordIcon} />
      <SocialButton label="Telegram" href={locale.startsWith('zh') ? 'https://t.me/curveficn' : 'https://t.me/curvefi'} icon={TelegramIcon} />
      <SocialButton label="Twitter" href="https://x.com/curvefinance" icon={TwitterIcon} />
      <SocialButton label="YouTube" href={locale.startsWith('zh') ? 'https://www.youtube.com/watch?v=FtzDlWdcou8&list=PLh7yM-DPEDYgP-vyEOCIboD3xg_TgJmkj' : 'https://www.youtube.com/@CurveFinanceChannel'} icon={YouTubeIcon} />
      {locale.startsWith('zh') && (
        <SocialButton label="Dodo" href="https://imdodo.com/s/147186?inv=7J46" icon={DodoIcon} />
      )}
    </Box>
  </SidebarSection>
)
