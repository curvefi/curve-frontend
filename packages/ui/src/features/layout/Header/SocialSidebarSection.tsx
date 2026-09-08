import TelegramIcon from '@mui/icons-material/Telegram'
import TwitterIcon from '@mui/icons-material/Twitter'
import YouTubeIcon from '@mui/icons-material/YouTube'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import SvgIcon from '@mui/material/SvgIcon'
import { Tooltip } from '@ui/components/Tooltip'
import { DiscordIcon } from '@ui/icons/DiscordIcon'
import { DodoIcon } from '@ui/icons/DodoIcon'
import { isChinese } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'
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
    <Box data-testid="social-buttons" sx={{ display: 'flex', justifyContent: 'space-around' }}>
      <SocialButton label="Discord" href={CURVE_SOCIALS.discord} icon={DiscordIcon} />
      <SocialButton
        label="Telegram"
        href={isChinese() ? CURVE_SOCIALS.telegram.cn : CURVE_SOCIALS.telegram.en}
        icon={TelegramIcon}
      />
      <SocialButton label="Twitter" href={CURVE_SOCIALS.twitter} icon={TwitterIcon} />
      <SocialButton
        label="YouTube"
        href={isChinese() ? CURVE_SOCIALS.youtube.cn : CURVE_SOCIALS.youtube.en}
        icon={YouTubeIcon}
      />
      {isChinese() && <SocialButton label="Dodo" href={CURVE_SOCIALS.dodo} icon={DodoIcon} />}
    </Box>
  </SidebarSection>
)
