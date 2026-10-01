/* eslint-disable @typescript-eslint/consistent-type-definitions,@typescript-eslint/no-empty-object-type */
import type { CustomMatchers } from './enforce-extension'

declare global {
  namespace n4s {
    interface EnforceMatchers extends CustomMatchers {}
  }
}
