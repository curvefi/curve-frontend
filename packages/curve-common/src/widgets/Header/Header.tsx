import { HeaderProps } from './types'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'

export const Header = <TChainId extends number>({ isMdUp, ...props }: HeaderProps<TChainId>) => isMdUp ?
  <DesktopHeader {...props} /> : <MobileHeader {...props} />;
