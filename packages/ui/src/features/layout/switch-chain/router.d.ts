import type { NetworkSwitchPolicy } from './util'

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StaticDataRouteOption {
    /** Defaults to switching networks on the same page (in GlobalLayout). */
    networkSwitch?: NetworkSwitchPolicy
  }
}
