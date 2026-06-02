import type { UTCTimestamp } from 'lightweight-charts'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Date {
    getUTCTimestamp(): UTCTimestamp
    getLocalTimestamp(): UTCTimestamp
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface BigInt {
    fromWei(): number
  }
}

Date.prototype.getUTCTimestamp = function () {
  return (this.getTime() / 1000) as UTCTimestamp
}

Date.prototype.getLocalTimestamp = function () {
  return ((this.getTime() - this.getTimezoneOffset() * 60000) / 1000) as UTCTimestamp
}

BigInt.prototype.fromWei = function () {
  return Number(this) / 10 ** 18
}

export {}
