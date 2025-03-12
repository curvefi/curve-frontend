import TelegramIcon from '@mui/icons-material/Telegram'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import SvgIcon from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import { isChinese } from '@ui-kit/lib/i18n'
import { DiscordIcon } from '@ui-kit/shared/icons/DiscordIcon'
import { DodoIcon } from '@ui-kit/shared/icons/DodoIcon'
import { SidebarSection } from './SidebarSection'

type SocialButtonProps = {
  label: string
  href: string
  icon: typeof SvgIcon
}

const SocialButton = ({ icon: Icon, href, label }: SocialButtonProps) => (
  <IconButton component={Link} href={href} target="_blank" rel="noopener noreferrer" size="small">
    <Tooltip title={label}>
      <Icon fontSize="large" color="primary" />
    </Tooltip>
  </IconButton>
)

type SocialSidebarSectionProps = { title: string }

export const SocialSidebarSection = ({ title }: SocialSidebarSectionProps) => (
  <SidebarSection title={title}>
    <Box display="flex" justifyContent="space-around">
      <SocialButton label="Discord" href="https://discord.gg/rgrfS7W" icon={DiscordIcon} />
      <SocialButton
        label="Telegram"
        href={isChinese() ? 'https://t.me/curveficn' : 'https://t.me/curvefi'}
        icon={TelegramIcon}
      />
      <SocialButton label="Twitter" href="https://x.com/curvefinance" icon={TwitterIcon} />
      <SocialButton
        label="YouTube"
        href={
          isChinese()
            ? 'https://www.youtube.com/watch?v=FtzDlWdcou8&list=PLh7yM-DPEDYgP-vyEOCIboD3xg_TgJmkj'
            : 'https://www.youtube.com/@CurveFinanceChannel'
        }
        icon={YouTubeIcon}
      />
      {isChinese() && <SocialButton label="Dodo" href="https://imdodo.com/s/147186?inv=7J46" icon={DodoIcon} />}
    </Box>
  </SidebarSection>
)
