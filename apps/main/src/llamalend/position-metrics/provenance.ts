/** Observation time carried by a query result. Stripped `QueryProp` values do not have this field. */
export type TimedQuery = { dataUpdatedAt: number }

export type RiskProvenance = {
  /** Oldest finite observation among the supplied times. */
  oldestAt: number | undefined
  /** False when any required input has no observation time. An incomplete set is not freshly verified. */
  complete: boolean
}

export const observationTime = (query: TimedQuery): number | undefined =>
  Number.isFinite(query.dataUpdatedAt) ? query.dataUpdatedAt : undefined

/** Uses the oldest required input. A missing time keeps the set incomplete. */
export const riskProvenance = (times: (number | undefined)[]): RiskProvenance => {
  const finite = times.filter((time): time is number => time != null && Number.isFinite(time))
  if (finite.length !== times.length) return { oldestAt: undefined, complete: false }
  return { oldestAt: Math.min(...finite), complete: true }
}
