import type { UTCTimestamp } from 'lightweight-charts'

declare global {
  interface Date {
    getUTCTimestamp(): UTCTimestamp
  }
}

Date.prototype.getUTCTimestamp = function () {
  return (this.getTime() / 1000) as UTCTimestamp
}

export {}
