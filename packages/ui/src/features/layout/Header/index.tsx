import { Toast } from '@ui/features/toast/Toast/Toast'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { HeaderProps } from './types'

export const Header = <TApp extends string>(props: HeaderProps<TApp>) => (
  <>
    {useIsDesktop() ? <DesktopHeader {...props} /> : <MobileHeader {...props} />}
    <Toast />
  </>
)
