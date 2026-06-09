export const toLocalTimestampSeconds = (timestampMs: number) => {
  const date = new Date(timestampMs)

  return (date.getTime() - date.getTimezoneOffset() * 60000) / 1000
}
