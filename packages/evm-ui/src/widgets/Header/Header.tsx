import { Toast } from '@evm-ui/widgets/Toast'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { HeaderProps } from './types'

export const Header = <TMenuApp extends string, TId extends string, TChainId extends number>(
  props: HeaderProps<TMenuApp, TId, TChainId>,
) => (
  <>
    useIsDesktop() ? <DesktopHeader {...props} /> : <MobileHeader {...props} />
    <Toast />
  </>
)
