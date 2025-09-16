import { createSvgIcon } from '@mui/material/utils'
import { rabbySvg } from '@ui-kit/shared/icons/RabbyWalletIcon'
import { frameSvg } from './FrameWalletIcon'
import { metamaskSvg } from './MetamaskWalletIcon'
import { phantomSvg } from './PhantomWalletIcon'

/**
 * An icon representing a browser wallet, combining icons from the different wallet plugins.
 */
export const BrowserWalletIcon = createSvgIcon(
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      {/* Top left - Rabby */}
      <g transform="translate(0, 0) scale(0.5)">{rabbySvg}</g>

      {/* Top right - Phantom */}
      <g transform="translate(50, 0) scale(0.5)">{phantomSvg}</g>

      {/* Bottom left - Frame */}
      <g transform="translate(0, 50) scale(0.5)">{frameSvg}</g>

      {/* Bottom right - Metamask */}
      <g transform="translate(50, 50) scale(1.5)">{metamaskSvg}</g>
    </g>
  </svg>,
  'BrowserWallet',
)
