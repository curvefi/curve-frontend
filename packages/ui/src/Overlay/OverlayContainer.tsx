import styled from 'styled-components'
import { OverlayContainer as Container } from 'react-aria'

import { breakpoints } from 'ui/src/utils/responsive'

const OverlayContainer = styled(Container)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: var(--dialog--background-color);

  width: 100%;
  height: 100%;
  z-index: var(--z-index-overlay);

  @media (min-width: ${breakpoints.sm}rem) {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
  }
`

export default OverlayContainer
