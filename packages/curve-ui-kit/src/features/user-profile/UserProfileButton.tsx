import PersonIcon from '@mui/icons-material/Person'
import IconButton from '@mui/material/IconButton'
import { AdvancedModeSwitch } from '@ui-kit/features/user-profile/settings/AdvancedModeSwitch'
import { ThemeToggleButton } from '@ui-kit/features/user-profile/settings/ThemeToggleButton'
import { useUserProfileButton } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { UserProfile } from './UserProfile'

export const UserProfileButton = () => {
  const [isOpen, open, close] = useSwitch(false)
  return (
    <>
      {useUserProfileButton() ? (
        <IconButton size="small" onClick={open}>
          <PersonIcon />
        </IconButton>
      ) : (
        <>
          <AdvancedModeSwitch label={t`Advanced`} />
          <ThemeToggleButton label={t`Mode`} />
        </>
      )}

      <UserProfile open={isOpen} onClose={close} />
    </>
  )
}
