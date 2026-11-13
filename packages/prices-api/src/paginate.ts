export async function paginate<T>(
  f: (page: number, offset: number) => Promise<T[]>,
  { page = 0, offset = 100, limit }: { page?: number; offset?: number; limit?: number } = {},
): Promise<T[]> {
  const xs = await f(page, offset)
  return [
    ...xs,
    ...(xs.length >= offset && (limit == null || limit > xs.length)
      ? await paginate(f, { page: page + 1, offset, ...(limit && { limit: limit - xs.length }) })
      : []),
  ]
}
