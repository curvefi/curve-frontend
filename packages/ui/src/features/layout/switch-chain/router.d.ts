/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { NetworkSwitchPolicy } from './switch-policies'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    /** Defaults to switching networks on the same page (in GlobalLayout). */
    networkSwitch?: NetworkSwitchPolicy
  }
}
