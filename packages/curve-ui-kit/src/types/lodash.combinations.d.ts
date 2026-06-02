/* eslint-disable @typescript-eslint/consistent-type-definitions */
import 'lodash'

declare module 'lodash' {
  interface LoDashStatic {
    combinations<T>(array: T[], size: number): T[][]
  }
}
