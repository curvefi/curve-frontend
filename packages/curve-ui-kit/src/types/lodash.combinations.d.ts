import 'lodash'

declare module 'lodash' {
  type LoDashStatic = {
    combinations<T>(array: T[], size: number): T[][]
  }
}
