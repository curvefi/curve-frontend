export type LeverageEligibility = 'yes' | 'no' | 'unknown'

export type CollateralHistoryEvent = {
  timestamp: number
  /** Present when the API supplies log order. Equal timestamps without it are ambiguous. */
  logIndex?: number
  isPositionClosed: boolean
  /** Present only when the prices API marked a supported leverage route. Null is not proof of an ordinary borrow. */
  leverage: { eventType: 'Deposit' | 'Repay' } | null
}

export type CollateralHistoryPage = {
  events: CollateralHistoryEvent[]
  count: number | null
  page: number | null
  pagination: number | null
  /**
   * True only after a checked route shows that a null leverage field means the event was not leverage.
   * Until then, a complete page of nulls stays unknown.
   */
  nullMeansOrdinaryBorrow: boolean
}

export type LeverageEligibilityResult = { eligibility: LeverageEligibility; reason: string }

const complete = (page: CollateralHistoryPage) =>
  page.count != null && page.count === page.events.length && (page.pagination == null || page.pagination <= 1)

export const currentLoanLeverageEligibility = (page: CollateralHistoryPage): LeverageEligibilityResult => {
  if (!complete(page)) {
    return {
      eligibility: 'unknown',
      reason: 'History completeness is not established. Count, page, or pagination does not match the returned events.',
    }
  }
  const ordered = page.events.toSorted((a, b) => a.timestamp - b.timestamp || (a.logIndex ?? 0) - (b.logIndex ?? 0))
  const timestamps = ordered.map(event => event.timestamp)
  const ambiguousTie = ordered.some((event, index) => {
    const next = ordered[index + 1]
    return next?.timestamp === event.timestamp && event.logIndex == null && next?.logIndex == null
  })
  if (ambiguousTie) {
    return {
      eligibility: 'unknown',
      reason: 'Two events share a timestamp and have no log order, so the current loan episode is ambiguous.',
    }
  }
  if (timestamps.some(timestamp => !Number.isFinite(timestamp))) {
    return { eligibility: 'unknown', reason: 'Event timestamps are not ordered.' }
  }

  let episodeStart = 0
  ordered.forEach((event, index) => {
    if (event.isPositionClosed) episodeStart = index + 1
  })
  const episode = ordered.slice(episodeStart)
  if (episode.some(event => event.leverage != null)) {
    return { eligibility: 'yes', reason: 'The current loan episode includes a leverage event.' }
  }
  if (!page.nullMeansOrdinaryBorrow) {
    return {
      eligibility: 'unknown',
      reason: 'No leverage metadata was returned. Null metadata is not proof this loan was opened without leverage.',
    }
  }
  return { eligibility: 'no', reason: 'The current loan episode has no leverage event.' }
}
