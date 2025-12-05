import { createSeriesMarkers, type SeriesMarker, type UTCTimestamp, type Time } from 'lightweight-charts'
import type { SingleValueSerie } from '../types'

type Markers = ReturnType<typeof createSeriesMarkers<Time>>
const markersMap = new WeakMap<SingleValueSerie, Markers>()

/**
 * Creates and manages series markers for a chart series within the visible time range
 *
 * @param serie The chart series (Area or Line type) to add markers to
 * @param markers Array of markers with timestamps to be displayed on the series
 */
export function createSerieMarkers(serie: SingleValueSerie, markers: SeriesMarker<UTCTimestamp>[]) {
  const times = serie
    .data()
    .map((x) => x.time as UTCTimestamp)
    .uniq()

  // Reset markers first if already present to make sure we start with a clean slate.
  const existingMarkers = markersMap.get(serie)
  if (existingMarkers) {
    existingMarkers.setMarkers([])
  }

  const markersInRange = markers.filter(
    (marker) => !times.length || (times[0] <= marker.time && marker.time <= times.at(-1)!),
  )

  const newMarkers = createSeriesMarkers(serie, markersInRange)
  markersMap.set(serie, newMarkers)
}
