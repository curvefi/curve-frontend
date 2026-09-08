import { Toast } from '@evm-ui/widgets/Toast'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { HeaderProps } from './types'

export const Header = <TApp extends string, TId extends string, TChainId extends number>(
  props: HeaderProps<TApp, TId, TChainId>,
) => (
  <>
    {useIsDesktop() ? <DesktopHeader {...props} /> : <MobileHeader {...props} />}
    <Toast />
  </>
)
