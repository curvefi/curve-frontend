/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { UTCTimestamp } from 'lightweight-charts'
import { toLocalTimestampSeconds } from '@primitives/timestamp.utils'

declare global {
  interface Date {
    getUTCTimestamp(): UTCTimestamp
    getLocalTimestamp(): UTCTimestamp
  }

  interface BigInt {
    fromWei(): number
  }
}

Date.prototype.getUTCTimestamp = function () {
  return (this.getTime() / 1000) as UTCTimestamp
}

Date.prototype.getLocalTimestamp = function () {
  return toLocalTimestampSeconds(this.getTime()) as UTCTimestamp
}

BigInt.prototype.fromWei = function () {
  return Number(this) / 10 ** 18
}

export {}
