import type { UTCTimestamp } from 'lightweight-charts'

declare global {
  interface Date {
    getUTCTimestamp(): UTCTimestamp
  }

  interface BigInt {
    fromWei(): number
  }
}

Date.prototype.getUTCTimestamp = function () {
  return (this.getTime() / 1000) as UTCTimestamp
}

BigInt.prototype.fromWei = function () {
  return Number(this) / 10 ** 18
}

export {}
