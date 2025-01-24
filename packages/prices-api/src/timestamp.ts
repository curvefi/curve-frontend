/**
 * Converts a timestamp string or number to UTC unix timestamp in seconds
 * @param timestamp - Timestamp as string (ISO format) or number (unix seconds)
 * @returns UTC timestamp in seconds
 * @example
 * toUTC(1234567890) // Returns 1234567890
 * toUTC("2024-01-01T00:00:00Z") // Returns 1704067200
 * toUTC("2024-01-01T00:00:00.123Z") // Returns 1704067200 (ignores ms)
 */
export function toUTC(timestamp: string | number): number {
  if (typeof timestamp === "number") {
    return timestamp;
  }

  const parsed = Number(timestamp);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const [date, time] = timestamp.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [timeWithoutZ] = time.split("."); // Handle milliseconds by splitting on dot
  const [hour, minute, second] = timeWithoutZ.split(":").map(Number);

  return Date.UTC(year, month - 1, day, hour, minute, second) / 1000;
}
